import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updatePagePropertiesAction } from 'controllers/pages';
import {
  defaultPaginationSelector,
  totalElementsSelector,
  totalPagesSelector,
  pageNumberSelector,
  sizeSelector,
} from './selectors';
import { PAGE_KEY, SIZE_KEY, DEFAULT_PAGE_SIZE } from './constants';

export const withPagination = ({
  namespace,
  namespaceSelector,
  paginationSelector = defaultPaginationSelector,
} = {}) => (WrappedComponent) => {
  const getTotalElements = totalElementsSelector(paginationSelector);
  const getTotalPages = totalPagesSelector(paginationSelector);

  @connect(
    (state) => ({
      totalElements: getTotalElements(state),
      totalPages: getTotalPages(state),
      namespace: namespaceSelector ? namespaceSelector(state) : namespace,
      page: pageNumberSelector(state, namespaceSelector ? namespaceSelector(state) : namespace),
      size: sizeSelector(state),
    }),
    {
      updatePageSize: (size) => updatePagePropertiesAction({ [SIZE_KEY]: size }),
      updatePageNumber: (number, queryNamespace) =>
        updatePagePropertiesAction({ [PAGE_KEY]: number }, queryNamespace),
    },
  )
  class PaginationWrapper extends Component {
    static displayName = `withPagination(${WrappedComponent.displayName || WrappedComponent.name})`;

    static propTypes = {
      filter: PropTypes.string,
      page: PropTypes.number,
      size: PropTypes.number,
      updatePageNumber: PropTypes.func,
      updatePageSize: PropTypes.func,
      totalElements: PropTypes.number,
      totalPages: PropTypes.number,
      namespace: PropTypes.string,
    };

    static defaultProps = {
      filter: null,
      page: 1,
      size: DEFAULT_PAGE_SIZE,
      totalElements: 0,
      totalPages: 1,
      updatePageNumber: () => {},
      updatePageSize: () => {},
      namespace: null,
    };

    changePageHandler = (page) => this.props.updatePageNumber(page, this.props.namespace);

    changeSizeHandler = (size) => {
      this.props.updatePageSize(size);
      this.changePageHandler(1);
    };

    render() {
      const {
        page,
        size,
        totalElements,
        totalPages,
        updatePageNumber,
        updatePageSize,
        ...restProps
      } = this.props;
      return (
        <WrappedComponent
          activePage={page}
          itemCount={totalElements}
          pageCount={totalPages}
          pageSize={size}
          onChangePage={this.changePageHandler}
          onChangePageSize={this.changeSizeHandler}
          {...restProps}
        />
      );
    }
  }

  return PaginationWrapper;
};
