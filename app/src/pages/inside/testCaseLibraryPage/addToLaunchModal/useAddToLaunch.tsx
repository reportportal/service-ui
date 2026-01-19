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

import { InjectedFormProps } from 'redux-form';
import { useDispatch } from 'react-redux';

import { TestPlanDto } from 'controllers/testPlan';
import { URLS } from 'common/urls';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { useDebouncedSpinner } from 'common/hooks';

import { AddToLaunchFormData, AddToLaunchModalProps } from './types';
import { SELECTED_TEST_PLAN_FIELD_NAME, SELECTED_LAUNCH_FIELD_NAME } from './addToLaunchModal';

export const useAddToLaunch = (
  props: Pick<InjectedFormProps<AddToLaunchFormData, AddToLaunchModalProps>, 'change'> & {
    projectKey: string;
  },
) => {
  const { change } = props;
  const dispatch = useDispatch();
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();

  const setSelectedTestPlan = (value: TestPlanDto | null) => {
    change(SELECTED_TEST_PLAN_FIELD_NAME, value || null);
  };

  const setSelectedLaunch = (value: TestPlanDto | null) => {
    change(SELECTED_LAUNCH_FIELD_NAME, value || null);
  };

  const addToLaunch = async (_data: AddToLaunchFormData) => {
    try {
      showSpinner();
      await fetch(URLS.addTestCaseToLaunch(projectKey, _data.selectedLaunch.id), {
        method: 'post',
        body: { testCaseId },
      });

      dispatch(
        showSuccessNotification({
          messageId: 'testPlanCreatedSuccess',
        }),
      );
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
    setSelectedTestPlan,
    setSelectedLaunch,
    addToLaunch,
    isLoading,
  };
};
