/*
 * Copyright 2022 EPAM Systems
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
import { NEXT, PREVIOUS } from 'controllers/log/constants';
import { MAX_PAGE_SIZE, PAGINATION_OFFSET } from './constants';

export const isLoadMoreButtonVisible = (pageData) => {
  if (!pageData || isEmptyObject(pageData)) {
    return false;
  }
  const { number, totalPages } = pageData;
  return number < totalPages;
};

export const isLoadPreviousButtonVisible = (pageData) => {
  if (!pageData || isEmptyObject(pageData)) {
    return false;
  }
  const { number } = pageData;
  return number !== 1;
};

export const isLoadCurrentStepButtonVisible = (pageData, step, allSteps) => {
  if (!pageData || isEmptyObject(pageData)) {
    return true;
  }
  const { id, hasContent } = step;
  if (hasContent) {
    const decisionArr = [];
    if (id in allSteps) {
      const stepsToCheck = allSteps[id].content;
      const filteredStepsToCheck = stepsToCheck.filter((item) => item.hasContent);
      for (let i = 0; i < filteredStepsToCheck.length; i += 1) {
        const nextStep = filteredStepsToCheck[i];
        const { id: stepId } = nextStep;
        const { page } = allSteps[stepId] || {};
        const isShouldShowBtn = isLoadCurrentStepButtonVisible(page, nextStep, allSteps);
        decisionArr.push(isShouldShowBtn);
      }
    } else if (!(id in allSteps)) {
      return true;
    }
    if (decisionArr.length) {
      return decisionArr.some((item) => !!item);
    }
  }

  const { size, totalElements } = pageData;
  return size < totalElements;
};

export function getDirectedPagination(pageData, loadDirection, nextPage) {
  const { number, size, totalElements } = pageData;
  switch (loadDirection) {
    case PREVIOUS: {
      return { [PAGE_KEY]: number - 1, [SIZE_KEY]: size + PAGINATION_OFFSET };
    }
    case NEXT: {
      const pageNumber = nextPage || 1;
      let pageSize;
      if (isEmptyObject(pageData) || nextPage) {
        pageSize = PAGINATION_OFFSET;
      } else {
        pageSize =
          size + PAGINATION_OFFSET >= totalElements ? totalElements : size + PAGINATION_OFFSET;
      }
      return { [PAGE_KEY]: pageNumber, [SIZE_KEY]: pageSize };
    }
    default: {
      return { [PAGE_KEY]: 1, [SIZE_KEY]: totalElements || MAX_PAGE_SIZE };
    }
  }
}
