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

import { isString } from 'lodash';

type LocationInfo = {
  payload: {
    testCasePageRoute: string | string[];
  };
};

type State = {
  location: LocationInfo;
};

export const locationSelector = (state: State) => state.location;

export const payloadSelector = (state: State) => locationSelector(state).payload;

export const urlTestCaseSlugSelector = (state: State): string => {
  const testCasePageRoute = payloadSelector(state).testCasePageRoute;
  let testCaseId: string | undefined;

  if (testCasePageRoute && isString(testCasePageRoute)) {
    testCaseId = testCasePageRoute.split('/')[3];
  } else if (Array.isArray(testCasePageRoute)) {
    testCaseId = testCasePageRoute?.[3];
  }

  return testCaseId ? String(testCaseId) : '';
};

export const urlFolderIdSelector = (state: State): string => {
  const testCasePageRoute = payloadSelector(state).testCasePageRoute || '';

  if (testCasePageRoute && isString(testCasePageRoute)) {
    return testCasePageRoute.split('/')[1];
  } else if (Array.isArray(testCasePageRoute)) {
    return testCasePageRoute?.[1];
  }

  return '';
};
