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

import { useDispatch, useSelector } from 'react-redux';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { deleteTestCaseSuccessAction } from 'controllers/testCase/actionCreators';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';

export const useDeleteTestCase = ({ isDetailsPage = false } = {}) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);

  const deleteTestCase = async (testCase: TestCase) => {
    try {
      showSpinner();

      await fetch(URLS.testCaseDetails(projectKey, testCase.id), {
        method: 'delete',
      });

      dispatch(deleteTestCaseSuccessAction({ testCase }));
      dispatch(hideModalAction());
      dispatch(showSuccessNotification({ messageId: 'testCaseDeletedSuccess' }));

      if (isDetailsPage) {
        dispatch({
          type: TEST_CASE_LIBRARY_PAGE,
          payload: {
            organizationSlug,
            projectSlug,
          },
        });
      }
    } catch (error: unknown) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  return { isLoading, deleteTestCase };
};
