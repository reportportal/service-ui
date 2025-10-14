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
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/dist/common/types';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinnerFormSubmit } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { getTestPlansAction } from 'controllers/testPlan';

interface UseDeleteTestPlanOptions {
  onSuccess?: VoidFn;
}

export const useDeleteTestPlan = ({ onSuccess = noop }: UseDeleteTestPlanOptions = {}) => {
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const { isLoading, submit } = useDebouncedSpinnerFormSubmit({
    requestFn: async (testPlanId: number) => {
      await fetch(URLS.testPlanById(projectKey, testPlanId), {
        method: 'delete',
      });

      dispatch(getTestPlansAction());
    },
    successMessageId: 'testPlanDeletedSuccess',
    errorMessageId: 'errorOccurredTryAgain',
    onSuccess,
  });

  return {
    isLoading,
    deleteTestPlan: submit,
  };
};
