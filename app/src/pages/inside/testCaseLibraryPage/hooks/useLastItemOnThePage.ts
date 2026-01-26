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

import { stringify } from 'qs';
import { push } from 'redux-first-router';
import { useSelector } from 'react-redux';
import { testCasesPageSelector, testCasesSelector } from 'controllers/testCase';
import { getTestCaseRequestParams } from '../utils';
import {
  locationQuerySelector,
  payloadSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';

interface UseLastItemOnThePage {
  numberOfLastElements?: number;
}

export interface UseLastItemOnThePageResult {
  isSingleItemOnTheLastPage: boolean;
  updateUrl: () => void;
}

export const useLastItemOnThePage = ({
  numberOfLastElements = 1,
}: UseLastItemOnThePage = {}): UseLastItemOnThePageResult => {
  const testCasesPageData = useSelector(testCasesPageSelector);
  const testCases = useSelector(testCasesSelector);
  const paginationParams = getTestCaseRequestParams(testCasesPageData);
  const { testCasePageRoute = '' } = useSelector(payloadSelector);
  const query = useSelector(locationQuerySelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const isSingleItemOnTheLastPage =
    testCasesPageData?.number === testCasesPageData?.totalPages &&
    testCases?.length === numberOfLastElements &&
    paginationParams.offset !== 0;
  const updateUrl = () => {
    if (isSingleItemOnTheLastPage) {
      const paginationParamsToUse = {
        ...paginationParams,
        offset: paginationParams.offset - paginationParams.limit,
      };
      const queryParams = stringify(
        {
          ...query,
          ...paginationParamsToUse,
        },
        { addQueryPrefix: true },
      );

      const url = `/organizations/${organizationSlug}/projects/${projectSlug}/testLibrary/${testCasePageRoute}${queryParams}`;

      push(url);
    }
  };

  return {
    isSingleItemOnTheLastPage,
    updateUrl,
  };
};
