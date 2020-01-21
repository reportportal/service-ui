/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter } from 'common/utils/connectRouter';
import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import { userIdSelector } from 'controllers/user';
import { defaultPaginationSelector, totalElementsSelector, totalPagesSelector } from './selectors';
import { PAGE_KEY, SIZE_KEY } from './constants';

const normalizeValue = (value) => (value > 0 ? value : undefined);

export const withPagination = ({
  paginationSelector = defaultPaginationSelector,
  namespace,
  namespaceSelector,
  offset,
} = {}) => (WrappedComponent) => {
  const getTotalElements = totalElementsSelector(paginationSelector);
  const getTotalPages = totalPagesSelector(paginationSelector);
  @connectRouter(
    (query) => ({
      page: query[PAGE_KEY] && normalizeValue(Number(query[PAGE_KEY])),
      size: query[SIZE_KEY] && normalizeValue(Number(query[SIZE_KEY])),
    }),
    {
      updatePagination: (page, size) => ({ [PAGE_KEY]: page, [SIZE_KEY]: size }),
    },
    { namespace, namespaceSelector, offset },
  )
  @connect((state) => ({
    totalElements: getTotalElements(state),
    totalPages: getTotalPages(state),
    namespace: namespaceSelector ? namespaceSelector(state) : namespace,
    userId: userIdSelector(state),
  }))
  class PaginationWrapper extends Component {
    static displayName = `withPagination(${WrappedComponent.displayName || WrappedComponent.name})`;

    static propTypes = {
      filter: PropTypes.string,
      page: PropTypes.number,
      size: PropTypes.number,
      updatePagination: PropTypes.func,
      sortingString: PropTypes.string,
      totalElements: PropTypes.number,
      totalPages: PropTypes.number,
      namespace: PropTypes.string,
      userId: PropTypes.string.isRequired,
    };

    static defaultProps = {
      filter: null,
      page: undefined,
      size: undefined,
      sortingString: null,
      totalElements: 0,
      totalPages: undefined,
      namespace: null,
      updatePagination: () => {},
    };

    componentDidUpdate() {
      if (this.props.totalPages === undefined) return;
      if (this.props.page > this.props.totalPages) {
        this.changePaginationOptions({ page: this.props.totalPages });
      }
    }

    getPageSize = () => {
      const { size, userId } = this.props;
      if (size === undefined && this.props.namespace) {
        const userSettings = getStorageItem(`${userId}_settings`) || {};
        return userSettings[this.calculateFieldName()] || size;
      }
      return size;
    };

    changePageHandler = (page) => {
      this.changePaginationOptions({ page });
    };

    changeSizeHandler = (size) => {
      const { userId } = this.props;
      if (this.props.namespace) {
        updateStorageItem(`${userId}_settings`, {
          [this.calculateFieldName()]: size,
        });
      }
      this.changePaginationOptions({ size, page: 1 });
    };

    changePaginationOptions = (options) => {
      const { page } = this.props;
      this.props.updatePagination(options.page || page, options.size || this.getPageSize());
    };

    calculateFieldName = () => `${this.props.namespace}PageSize`;

    render() {
      const { page, size, totalElements, totalPages, updatePagination, ...restProps } = this.props;
      return (
        <WrappedComponent
          activePage={page}
          itemCount={totalElements}
          pageCount={totalPages}
          pageSize={this.getPageSize()}
          onChangePage={this.changePageHandler}
          onChangePageSize={this.changeSizeHandler}
          {...restProps}
        />
      );
    }
  }

  return PaginationWrapper;
};
