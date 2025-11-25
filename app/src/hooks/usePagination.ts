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

import { defineMessages, useIntl } from 'react-intl';
import { useState } from 'react';

import {
  DEFAULT_CURRENT_PAGE,
  DEFAULT_ITEMS_PER_PAGE,
} from 'pages/inside/common/testCaseList/configUtils';

export const messages = defineMessages({
  items: {
    id: 'Pagination.items',
    defaultMessage: 'items',
  },
  of: {
    id: 'Pagination.of',
    defaultMessage: 'of',
  },
  page: {
    id: 'Pagination.page',
    defaultMessage: 'Page',
  },
  goToPage: {
    id: 'Pagination.goToPage',
    defaultMessage: 'Go to page',
  },
  go: {
    id: 'Pagination.go',
    defaultMessage: 'Go',
  },
  perPage: {
    id: 'Pagination.perPage',
    defaultMessage: 'per page',
  },
});

export const usePagination = ({ totalItems = 0, itemsPerPage = DEFAULT_ITEMS_PER_PAGE }) => {
  const { formatMessage } = useIntl();
  const [activePage, setActivePage] = useState<number>(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState<number>(itemsPerPage);

  const totalPages = Math.ceil(totalItems / pageSize);

  const changePageSize = (size: number) => {
    setPageSize(size);
    setActivePage(DEFAULT_CURRENT_PAGE);
  };

  const captions = {
    items: formatMessage(messages.items),
    of: formatMessage(messages.of),
    page: formatMessage(messages.page),
    goTo: formatMessage(messages.goToPage),
    goAction: formatMessage(messages.go),
    perPage: formatMessage(messages.perPage),
  };

  return {
    captions,
    activePage,
    pageSize,
    totalPages,
    setActivePage,
    changePageSize,
  };
};
