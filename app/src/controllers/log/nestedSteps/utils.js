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
import { NEXT, PREVIOUS, ALL } from 'controllers/log/constants';
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
  const { number, firstNumber = number } = pageData;
  return firstNumber !== 1;
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

  const { size, loaded = size, totalElements } = pageData;
  return loaded < totalElements;
};

// The step keeps a window of loaded pages of PAGINATION_OFFSET items: page.firstNumber..page.number.
// "Previous"/"next" request only the adjacent page and add it to the loaded content.
export function getDirectedPagination(pageData, loadDirection, nextPage) {
  const { number, firstNumber = number } = pageData;
  switch (loadDirection) {
    case PREVIOUS: {
      return { [PAGE_KEY]: firstNumber - 1, [SIZE_KEY]: PAGINATION_OFFSET };
    }
    case NEXT: {
      const pageNumber = isEmptyObject(pageData) || nextPage ? nextPage || 1 : number + 1;
      return { [PAGE_KEY]: pageNumber, [SIZE_KEY]: PAGINATION_OFFSET };
    }
    default: {
      return { [PAGE_KEY]: 1, [SIZE_KEY]: MAX_PAGE_SIZE };
    }
  }
}

// Combines a loaded page with the content the step already has for the given load direction.
export const mergeNestedStepPage = (current, response, loadDirection, nextPage) => {
  const { content: currentContent = [], page: currentPage = {} } = current;
  const { content = [], page = {} } = response;
  const isAppend = loadDirection === NEXT && !nextPage && !isEmptyObject(currentPage);
  const isPrepend = loadDirection === PREVIOUS && !isEmptyObject(currentPage);
  const { number: currentNumber, firstNumber: currentFirstNumber = currentNumber } = currentPage;

  if (isAppend) {
    const mergedContent = currentContent.concat(content);
    return {
      content: mergedContent,
      page: { ...page, firstNumber: currentFirstNumber, loaded: mergedContent.length },
    };
  }
  if (isPrepend) {
    const mergedContent = content.concat(currentContent);
    return {
      content: mergedContent,
      page: {
        ...page,
        number: currentNumber,
        firstNumber: page.number,
        loaded: mergedContent.length,
      },
    };
  }
  const firstNumber = loadDirection === ALL ? 1 : page.number;
  return { content, page: { ...page, firstNumber, loaded: content.length } };
};
