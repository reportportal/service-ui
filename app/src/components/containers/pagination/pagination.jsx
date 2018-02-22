import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { activeProjectSelector } from 'controllers/user';
import { fetch } from 'common/utils';

const PAGE_KEY = 'page.page';
const SIZE_KEY = 'page.size';

export const withPagination = ({ url }) => WrappedComponent => withRouter(
  connect(state => ({
    activeProject: activeProjectSelector(state),
  }))(
    class PaginationWrapper extends PureComponent {
      static propTypes = {
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        match: PropTypes.object.isRequired,
        activeProject: PropTypes.string,
        requestParams: PropTypes.object,
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
        const query = this.props.location.query;
        const { page, size } = this.parseQuery(query);
        this.fetchData(
          { page, size, ...this.props.requestParams },
          this.props.activeProject,
        );
      }

      componentWillReceiveProps({ location: { query }, activeProject, requestParams }) {
        const { page, size } = this.parseQuery(query);
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

      changePaginationOptions = (options) => {
        const query = this.props.location.query;
        const { page, size } = this.parseQuery(query);
        this.props.history.push({
          pathname: this.props.location.pathname,
          query: {
            ...this.props.location.query,
            [SIZE_KEY]: options.size || size,
            [PAGE_KEY]: options.page || page,
          },
        });
      };

      parseQuery = query => ({
        page: Number(query[PAGE_KEY]) || this.state.activePage,
        size: Number(query[SIZE_KEY]) || this.state.pageSize,
      });

      render() {
        const {
          location,
          history,
          activeProject,
          requestParams,
          match,
          ...restProps
        } = this.props;
        return (
          <WrappedComponent
            data={this.state.data}
            activePage={this.state.activePage}
            itemCount={this.state.totalElements}
            pageCount={this.state.totalPages}
            pageSize={this.state.pageSize}
            onChangePage={this.changePageHandler}
            onChangePageSize={this.changeSizeHandler}
            {...restProps}
          />
        );
      }
    }));
