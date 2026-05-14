/*
 * Copyright 2026 EPAM Systems
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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { noop } from 'es-toolkit';

import { TEST_PLANS_PAGE_EVENTS } from 'analyticsEvents/testPlansPageEvents';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { fetchSuccessAction } from 'controllers/fetch';
import {
  getTestPlanAction,
  defaultTestPlanTestCasesQueryParams,
  TEST_PLAN_FOLDERS_NAMESPACE,
} from 'controllers/testPlan';
import type { TestPlanFoldersDto } from 'controllers/testPlan/types';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';
import { LocationInfo } from 'controllers/pages/typed-selectors';
import { useTestPlanId } from 'hooks/useTypedSelector';
import { useTestPlanActiveFolders } from 'pages/inside/common/hooks';

import { removeTestCasesFromTestPlanMessages } from './messages';
import { UseRemoveTestCasesFromTestPlanOptions } from './types';

export const useRemoveTestCasesFromTestPlan = ({
  onSuccess = noop,
}: UseRemoveTestCasesFromTestPlanOptions) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testPlanId = useTestPlanId();
  const testCasesSearchParams = useSelector(
    (state: { location: LocationInfo }) => state.location?.query?.testCasesSearchParams,
  );
  const { activeFolderId, payload } = useTestPlanActiveFolders();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const removeTestCasesFromTestPlan = useCallback(
    async (testCaseIds: number[]) => {
      const numericTestPlanId = Number(testPlanId);

      try {
        showSpinner();

        await fetch(URLS.testPlanTestCasesBatch(projectKey, numericTestPlanId), {
          method: 'delete',
          data: {
            testCaseIds,
          },
        });

        const updatedFolders: TestPlanFoldersDto = await fetch(
          URLS.testFolders(projectKey, { 'filter.eq.testPlanId': numericTestPlanId }),
        );

        dispatch(fetchSuccessAction(TEST_PLAN_FOLDERS_NAMESPACE, updatedFolders));

        const isActiveFolderRemoved =
          activeFolderId !== null &&
          !updatedFolders.content.some((folder) => folder.id === activeFolderId);
        const targetTestPlanRoute = isActiveFolderRemoved ? undefined : payload?.testPlanRoute;
        const targetFolderId = isActiveFolderRemoved ? undefined : (activeFolderId ?? undefined);

        dispatch({
          type: PROJECT_TEST_PLAN_DETAILS_PAGE,
          payload: {
            ...payload,
            testPlanRoute: targetTestPlanRoute,
          },
          meta: { query: { testCasesSearchParams } },
        });

        dispatch(
          getTestPlanAction({
            testPlanId: numericTestPlanId,
            folderId: targetFolderId,
            testCasesSearchParams,
            ...defaultTestPlanTestCasesQueryParams,
          }),
        );

        trackEvent(TEST_PLANS_PAGE_EVENTS.SUBMIT_REMOVE_TEST_FROM_PLAN);

        showSuccessNotification({
          messageId: 'removeFromTestPlanSuccess',
          values: { count: testCaseIds.length },
        });

        onSuccess?.();
      } catch (error) {
        showErrorNotification({
          message:
            (error as Error).message ||
            formatMessage(removeTestCasesFromTestPlanMessages.removeFromTestPlanError),
        });
        throw error;
      } finally {
        hideSpinner();
      }
    },
    [
      formatMessage,
      showSpinner,
      projectKey,
      testPlanId,
      dispatch,
      payload,
      activeFolderId,
      testCasesSearchParams,
      showSuccessNotification,
      onSuccess,
      showErrorNotification,
      hideSpinner,
      trackEvent,
    ],
  );

  return {
    isLoading,
    removeTestCasesFromTestPlan,
  };
};
