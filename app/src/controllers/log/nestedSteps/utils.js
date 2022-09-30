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

import { isEmptyObject } from 'common/utils';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { PREVIOUS } from 'controllers/log';
import { PAGINATION_OFFSET } from './constants';

export const isLoadMoreButtonVisible = (step) => {
  if (!step || isEmptyObject(step.page)) {
    return false;
  }
  const {
    page: { number, totalPages },
  } = step;
  return number < totalPages;
};

export const isLoadPreviousButtonVisible = (step) => {
  if (!step || isEmptyObject(step.page)) {
    return false;
  }
  const {
    page: { number },
  } = step;
  return number !== 1;
};

export function getPagination(page, loadDirection, errorLogPage) {
  const { number, size, totalElements } = page;

  if (loadDirection === PREVIOUS) {
    return { [PAGE_KEY]: number - 1, [SIZE_KEY]: size + PAGINATION_OFFSET };
  } else {
    const pageNumber = errorLogPage || 1;
    let pageSize;
    if (size >= totalElements) {
      pageSize = totalElements;
    } else if (isEmptyObject(page) || errorLogPage) {
      pageSize = PAGINATION_OFFSET;
    } else {
      pageSize = size + PAGINATION_OFFSET;
    }
    return { [PAGE_KEY]: pageNumber, [SIZE_KEY]: pageSize };
  }
}
