/*
 * Copyright 2024 EPAM Systems
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

import { Pagination } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';
import { useLayoutEffect, useState } from 'react';
import classNames from 'classnames/bind';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGINATION,
  defaultPaginationSelector,
  PAGE_KEY,
  SIZE_KEY,
} from 'controllers/pagination';
import { connectRouter } from 'common/utils';
import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import { userIdSelector } from 'controllers/user';
import styles from './withPagination.scss';

const cx = classNames.bind(styles);

const PAGE = 'Page';
const PAGE_SIZE = 'PageSize';
const normalizeValue = (value) => (value > 0 ? value : undefined);

export const withPagination = ({
  namespace,
  pageSizeOptions,
  paginationSelector = defaultPaginationSelector,
  defaultPageSize = DEFAULT_PAGE_SIZE,
} = {}) => (WrappedComponent) =>
  connectRouter(
    (query) => ({
      page: query[PAGE_KEY] && normalizeValue(Number(query[PAGE_KEY])),
      size: query[SIZE_KEY] && normalizeValue(Number(query[SIZE_KEY])),
    }),
    {
      updatePagination: (page, size) => ({ [PAGE_KEY]: page, [SIZE_KEY]: size }),
    },
    {},
  )(({ captions, updatePagination, page: queryPage, size: queryPageSize, ...props }) => {
    const userId = useSelector(userIdSelector);
    const { totalElements, totalPages } = useSelector(paginationSelector);
    const [pageSize, setPageSize] = useState();
    const [page, setPage] = useState();

    const updateStorage = (value, propertyName) => {
      if (namespace) {
        updateStorageItem(`${userId}_settings`, {
          [`${namespace}${propertyName}`]: value,
        });
      }
    };

    useLayoutEffect(() => {
      const userSettings = getStorageItem(`${userId}_settings`) || {};

      const hashPage =
        queryPage ||
        normalizeValue(Number(userSettings[`${namespace}${PAGE}`])) ||
        DEFAULT_PAGINATION[PAGE_KEY];

      const hashPageSize =
        queryPageSize ||
        normalizeValue(Number(userSettings[`${namespace}${PAGE_SIZE}`])) ||
        defaultPageSize;

      setPageSize(hashPageSize);
      setPage(hashPage);
      updatePagination(hashPage, hashPageSize);
      updateStorage(hashPage, PAGE);
      updateStorage(hashPageSize, PAGE_SIZE);
    }, []);

    const changePage = (newPage) => {
      setPage(newPage);
      updateStorage(newPage, PAGE);
      updatePagination(newPage, pageSize);
    };

    const changePageSize = (newPageSize) => {
      setPageSize(newPageSize);
      updateStorage(newPageSize, PAGE_SIZE);
      updatePagination(page, newPageSize);
    };

    return (
      <div className={cx('with-pagination-container')}>
        <WrappedComponent {...props} />
        <div className={cx('with-pagination')}>
          <Pagination
            pageSize={pageSize}
            activePage={page}
            totalItems={totalElements}
            totalPages={totalPages}
            pageSizeOptions={pageSizeOptions}
            changePage={changePage}
            changePageSize={changePageSize}
            captions={captions}
          />
        </div>
      </div>
    );
  });
