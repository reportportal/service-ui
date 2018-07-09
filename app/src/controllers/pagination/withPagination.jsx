import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils';
import { defaultPaginationSelector, totalElementsSelector, totalPagesSelector } from './selectors';
import { PAGE_KEY, SIZE_KEY } from './constants';

const FILTER_KEY = 'filter.cnt.name';
const SORTING_KEY = 'page.sort';

export const withPagination = ({
  url: staticURL,
  paginationSelector = defaultPaginationSelector,
  fetchAction = () => {},
  namespace,
  namespaceSelector,
} = {}) => (WrappedComponent) => {
  const getTotalElements = totalElementsSelector(paginationSelector);
  const getTotalPages = totalPagesSelector(paginationSelector);

  @connectRouter(
    (query) => ({
      page: query[PAGE_KEY] && Number(query[PAGE_KEY]),
      size: query[SIZE_KEY] && Number(query[SIZE_KEY]),
    }),
    {
      updatePagination: (page, size) => ({ [PAGE_KEY]: page, [SIZE_KEY]: size }),
    },
    { namespace, namespaceSelector },
  )
  @connect(
    (state) => ({
      totalElements: getTotalElements(state),
      totalPages: getTotalPages(state),
    }),
    {
      fetchAction,
    },
  )
  class PaginationWrapper extends Component {
    static propTypes = {
      filter: PropTypes.string,
      page: PropTypes.number,
      size: PropTypes.number,
      url: PropTypes.string,
      updatePagination: PropTypes.func,
      sortingString: PropTypes.string,
      totalElements: PropTypes.number,
      totalPages: PropTypes.number,
      fetchAction: PropTypes.func,
    };

    static defaultProps = {
      url: staticURL,
      filter: null,
      page: undefined,
      size: undefined,
      sortingString: null,
      totalElements: 0,
      totalPages: 1,
      updatePagination: () => {},
      fetchAction: () => {},
    };

    fetchData = (url, queryParams = {}) =>
      this.props.fetchAction({
        params: {
          [PAGE_KEY]: queryParams.page,
          [SIZE_KEY]: queryParams.size,
          [FILTER_KEY]: queryParams.filter,
          [SORTING_KEY]: queryParams.sortingString,
        },
      });

    fetchDataWithCurrentProps = () => {
      const { url, page, size, filter, sortingString } = this.props;
      return this.fetchData(url, { page, size, filter, sortingString });
    };

    changePageHandler = (page) => this.changePaginationOptions({ page });

    changeSizeHandler = (size) => this.changePaginationOptions({ size, page: 1 });

    changePaginationOptions = (options) => {
      const { page, size } = this.props;
      this.props.updatePagination(options.page || page, options.size || size);
    };

    render() {
      const { page, size, totalElements, totalPages, ...restProps } = this.props;
      return (
        <WrappedComponent
          activePage={page}
          itemCount={totalElements}
          pageCount={totalPages}
          pageSize={size}
          onChangePage={this.changePageHandler}
          onChangePageSize={this.changeSizeHandler}
          fetchData={this.fetchDataWithCurrentProps}
          {...restProps}
        />
      );
    }
  }

  return PaginationWrapper;
};
