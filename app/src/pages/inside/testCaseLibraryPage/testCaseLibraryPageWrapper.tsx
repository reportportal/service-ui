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
import { HistoryOfActions } from 'pages/inside/testCaseLibraryPage/historyOfActions';
import { TestCaseLibraryPage } from 'pages/inside/testCaseLibraryPage/testCaseLibraryPage';
import { TestCaseDetailsPage } from 'pages/inside/testCaseLibraryPage/testCaseDetailsPage';
import { payloadSelector } from 'controllers/pages';

export const TestCaseLibraryPageWrapper = () => {
  const payload = useSelector(payloadSelector);
  const testCasePageRoute = payload?.testCasePageRoute;
  const folderRegExp = /^folder\/([^/]+)$/;
  const testCaseRegExp = /^folder\/([^/]+)\/test-cases\/([^/]+)$/;
  const historyOfActionsRegExp = /^folder\/([^/]+)\/test-cases\/([^/]+)\/historyOfActions/;
  let folderMatch: boolean = false;
  let testCaseMatch: boolean = false;
  let historyOfActionsMatch: boolean = false;

  if (typeof testCasePageRoute === 'string') {
    folderMatch = folderRegExp.test(testCasePageRoute);
    testCaseMatch = testCaseRegExp.test(testCasePageRoute);
    historyOfActionsMatch = historyOfActionsRegExp.test(testCasePageRoute);
  } else if (Array.isArray(testCasePageRoute)) {
    folderMatch = Boolean(
      testCasePageRoute[0] === 'folder' && testCasePageRoute[1] && !testCasePageRoute[2],
    );
    testCaseMatch = Boolean(
      testCasePageRoute[0] === 'folder' &&
        testCasePageRoute[2] === 'test-cases' &&
        testCasePageRoute[3] &&
        !testCasePageRoute[4],
    );
    historyOfActionsMatch = Boolean(
      testCasePageRoute[0] === 'folder' &&
        testCasePageRoute[2] === 'test-cases' &&
        testCasePageRoute[4] === 'historyOfActions',
    );
  }

  if (historyOfActionsMatch) {
    return <HistoryOfActions />;
  }

  if (testCaseMatch) {
    return <TestCaseDetailsPage />;
  }

  if (!testCasePageRoute || folderMatch) {
    return <TestCaseLibraryPage />;
  }

  return <TestCaseLibraryPage />;
};
