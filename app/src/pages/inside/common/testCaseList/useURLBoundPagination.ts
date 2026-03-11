/*
 * Copyright 2025 EPAM Systems
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

import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { push } from 'redux-first-router';
import { stringify } from 'qs';

import { usePagination } from 'hooks/usePagination';
import { locationQuerySelector } from 'controllers/pages';
import { queryParamsType } from 'types/common';
import { PageInfo } from 'controllers/testPlan';

type UseURLBoundPagination = {
  pageData: PageInfo;
  defaultQueryParams: queryParamsType;
  namespace: string;
  shouldSaveUserPreferences: boolean;
  baseUrl: string;
};

export const useURLBoundPagination = ({
  pageData,
  defaultQueryParams,
  namespace,
  shouldSaveUserPreferences,
  baseUrl,
}: UseURLBoundPagination) => {
  const initialPageNumber = 1;
  const query = useSelector(locationQuerySelector);
  const { captions, activePage, pageSize, totalPages, setActivePage, changePageSize } =
    usePagination({
      totalItems: pageData?.totalElements,
      itemsPerPage: defaultQueryParams.limit,
      namespace,
      shouldSaveUserPreferences,
    });

  useEffect(() => {
    if (query?.offset && query?.limit) {
      changePageSize(Number(query.limit));
      setActivePage(Math.floor(Number(query.offset) / Number(query.limit) + 1));
    } else {
      setActivePage(initialPageNumber);
    }
  }, [query?.offset, query?.limit, changePageSize, setActivePage]);

  const changeUrlParams = ({ limit, offset }: queryParamsType): void => {
    const queryParams = {
      ...query,
      offset,
      limit,
    };
    const url = `${baseUrl}${stringify(queryParams, { addQueryPrefix: true })}`;

    push(url);
  };

  const setPageNumber = (page: number): void => {
    const offset = (page - 1) * pageSize;

    if (offset !== Number(query?.offset)) {
      changeUrlParams({ limit: pageSize, offset });
    }
  };

  const setPageSize = (pageSize: number): void => {
    if (pageSize !== Number(query?.limit)) {
      changeUrlParams({ limit: pageSize, offset: defaultQueryParams.offset });
    }
  };

  const offset = (activePage - 1) * pageSize;

  return {
    setPageNumber,
    setPageSize,
    captions,
    activePage,
    offset,
    pageSize,
    totalPages,
  };
};
