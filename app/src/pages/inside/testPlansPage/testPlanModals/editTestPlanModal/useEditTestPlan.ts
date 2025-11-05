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
import { getTestPlansAction, getTestPlanAction } from 'controllers/testPlan';

import { transformFormAttributesToBackend } from '../testPlanModal/testPlanAttributes/useTmsAttributes';
import { TestPlanFormValues } from '../testPlanModal';

interface EditTestPlanFormValues extends TestPlanFormValues {
  id: number;
}

export const useEditTestPlan = () => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const submitTestPlan = async (payload: EditTestPlanFormValues) => {
    try {
      showSpinner();

      const attributes = transformFormAttributesToBackend(payload.attributes);

      await fetch(URLS.testPlanById(projectKey, payload.id), {
        method: 'put',
        data: {
          name: payload.name,
          description: payload.description,
          attributes,
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testPlanUpdatedSuccess',
        }),
      );
      dispatch(getTestPlansAction());
      dispatch(getTestPlanAction({ testPlanId: payload.id }));
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
