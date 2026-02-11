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
import { updateDescriptionSuccessAction } from 'controllers/testCase/actionCreators';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export const useDescription = (testCaseId: number) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const updateDescription = async (description: string) => {
    try {
      showSpinner();

      await fetch(URLS.testCaseDetails(projectKey, testCaseId), {
        method: 'patch',
        data: {
          description,
        },
      });

      dispatch(updateDescriptionSuccessAction(description));
      dispatch(hideModalAction());
      dispatch(showSuccessNotification({ messageId: 'testCaseDescriptionUpdateSuccess' }));
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

  return { isLoading, updateDescription };
};
