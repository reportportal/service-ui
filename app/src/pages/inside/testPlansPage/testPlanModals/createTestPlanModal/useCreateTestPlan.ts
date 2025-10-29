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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import { getTestPlansAction, TestPlanDto } from 'controllers/testPlan';

import { TestPlanFormValues } from '../testPlanModal';

export const useCreateTestPlan = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const submitTestPlan = async (payload: TestPlanFormValues) => {
    try {
      showSpinner();

      await fetch<TestPlanDto>(URLS.testPlan(projectKey), {
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
      dispatch(getTestPlansAction());
    } catch {
      dispatch(
        showErrorNotification({
          messageId: 'errorOccurredTryAgain',
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  return {
    isLoading,
    submitTestPlan,
  };
};
