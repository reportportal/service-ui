import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { fetch } from 'common/utils';
import { pagePropertiesSelector, updatePagePropertiesAction } from 'controllers/page';

const PAGE_KEY = 'page.page';
const SIZE_KEY = 'page.size';

export const withPagination = ({ url }) => WrappedComponent =>
  connect(state => ({
	pageProperties: pagePropertiesSelector(state),
    activeProject: activeProjectSelector(state),
  }), (dispatch, ownProps) => {
	  const update = options =>
		dispatch(
			updatePagePropertiesAction(options));
	  return {
	    onChangePage: page => update({[PAGE_KEY]: options.page || ownProps.page}),
	    onChangePageSize: size => update({[SIZE_KEY]: options.size || ownProps.size})
	  };
  })(
    class PaginationWrapper extends PureComponent {
      static propTypes = {
        pageProperties: PropTypes.object.isRequired,
        activeProject: PropTypes.string,
        requestParams: PropTypes.object,

		updatePageProperties: PropTypes.func.isRequired
      };

      static defaultProps = {
        activeProject: '',
        requestParams: {},
      };

      state = {
        data: [],
        totalElements: 0,
        totalPages: 0,
        pageSize: 0,
        activePage: 1,
      };

      componentDidMount() {
        const query = this.props.pageProperties;
        const { page, size } = this.parseQuery(query);
        this.fetchData(
          { page, size, ...this.props.requestParams },
          this.props.activeProject,
        );
      }

      componentWillReceiveProps({ pageProperties, activeProject, requestParams }) {
        const { page, size } = this.parseQuery(pageProperties);
        if (page !== this.state.activePage
          || size !== this.state.pageSize
          || requestParams !== this.props.requestParams
        ) {
          this.fetchData({ page, size, ...requestParams }, activeProject);
        }
      }

      fetchData = (queryParams, activeProject) => fetch(url(activeProject), {
        params: {
          [PAGE_KEY]: queryParams.page,
          [SIZE_KEY]: queryParams.size,
          filter: queryParams.filter,
        },
      }).then((result) => {
        const { number, size, totalElements, totalPages } = result.page;
        this.setState({
          pageSize: size,
          activePage: number,
          totalElements,
          totalPages,
          data: result.content,
        });
      });

      changePageHandler = page => this.changePaginationOptions({ page });

      changeSizeHandler = size => this.changePaginationOptions({ size });

      changePaginationOptions = options =>
		dispatch(
			updatePagePropertiesAction({
				[SIZE_KEY]: options.size || size,
				[PAGE_KEY]: options.page || page,
			}));

      parseQuery = query => ({
        page: Number(query[PAGE_KEY]) || this.state.activePage,
        size: Number(query[SIZE_KEY]) || this.state.pageSize,
      });

      render() {
        const {
		  onChangePage,
		  onChangePageSize,
          ...restProps
        } = this.props;
        return (
          <WrappedComponent
            data={this.state.data}
            activePage={this.state.activePage}
            itemCount={this.state.totalElements}
            pageCount={this.state.totalPages}
            pageSize={this.state.pageSize}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
            {...restProps}
          />
        );
      }
    });
