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
import { VoidFn } from '@reportportal/ui-kit/common';
import { push } from 'redux-first-router';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useQueryParams } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showSuccessNotification, showErrorNotification } from 'controllers/notification';
import {
  defaultQueryParams,
  getTestPlansAction,
  testPlansPageSelector,
  testPlansSelector,
} from 'controllers/testPlan';
import { useProjectDetails } from 'hooks/useTypedSelector';

interface UseDeleteTestPlanOptions {
  onSuccess?: VoidFn;
}

export const useDeleteTestPlan = ({ onSuccess = noop }: UseDeleteTestPlanOptions = {}) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { organizationSlug, projectSlug } = useProjectDetails();
  const testPlansPageData = useSelector(testPlansPageSelector);
  const testPlans = useSelector(testPlansSelector);
  const queryParams = useQueryParams(defaultQueryParams);

  const deleteTestPlan = async (testPlanId: number) => {
    try {
      showSpinner();

      await fetch(URLS.testPlanById(projectKey, testPlanId), {
        method: 'delete',
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testPlanDeletedSuccess',
        }),
      );

      const isSingleItemOnTheLastPage =
        testPlansPageData?.number === testPlansPageData?.totalPages && testPlans?.length === 1;

      if (isSingleItemOnTheLastPage) {
        const offset = Number(queryParams.offset) - Number(queryParams.limit);
        const url = `/organizations/${organizationSlug}/projects/${projectSlug}/testPlans?
        offset=${offset}&limit=${queryParams.limit}`;

        push(url);
      } else {
        dispatch(getTestPlansAction(queryParams));
      }

      onSuccess();
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
    deleteTestPlan,
  };
};
