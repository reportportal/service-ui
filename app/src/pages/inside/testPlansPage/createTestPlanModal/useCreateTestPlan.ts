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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';

import { messages } from './messages';

export interface CreateTestPlanFormData {
  name: string;
  description: string;
}

export const useCreateTestPlan = () => {
  const { isLoading: isCreateTestPlanLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector) as string;
  const { formatMessage } = useIntl();

  const createTestPlan = async (payload: CreateTestPlanFormData) => {
    try {
      showSpinner();

      await fetch(URLS.testPlan(projectKey), {
        method: 'post',
        data: {
          name: payload.name,
          description: payload.description,
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testPlanCreatedSuccess',
        }),
      );
    } catch (error) {
      if (error?.message?.includes('tms_test_plan_name_unique')) {
        throw new SubmissionError({
          name: formatMessage(messages.duplicateTestPlanName),
        });
      } else {
        dispatch(
          showErrorNotification({
            messageId: 'testPlanCreationFailed',
          }),
        );
      }
    } finally {
      hideSpinner();
    }
  };

  return {
    isCreateTestPlanLoading,
    createTestPlan,
  };
};
