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

import { useRef, useState } from 'react';
import { getFormValues, InjectedFormProps } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';

import {
  ADD_TO_TEST_PLAN_CONDITION,
  TEST_CASE_LIBRARY_EVENTS,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import type { TestPlanDto } from 'controllers/testPlan/types';
import { foldersSelector } from 'controllers/testCase';
import { getAllSubfolderIds } from 'common/utils/folderUtils';

import { fetchAllTestCases } from '../../common/testLibrarySidePanel/utils';
import {
  AddTestCasesToTestPlanFormData,
  AddTestCasesToTestPlanModalData,
  AddTestCasesToTestPlanModalProps,
} from './types';
import { ADD_TO_TEST_PLAN_MODAL_FORM, SELECTED_TEST_PLAN_FIELD_NAME } from './constants';

export const useAddTestCasesToTestPlan = ({
  folderId,
  itemCount,
  selectedTestCaseIds,
  change,
}: AddTestCasesToTestPlanModalData &
  Pick<
    InjectedFormProps<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>,
    'change'
  >) => {
  const {
    isLoading: isAddTestCasesToTestPlanLoading,
    showSpinner,
    hideSpinner,
  } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const projectKey = useSelector(projectKeySelector);
  const folders = useSelector(foldersSelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const [isFetchingTestCases, setIsFetchingTestCases] = useState(false);

  const autompleteInputRef = useRef<HTMLInputElement>(null);

  const isFromFolder = folderId !== undefined;

  const { selectedTestPlan } = useSelector(
    (state) =>
      (getFormValues(ADD_TO_TEST_PLAN_MODAL_FORM)(state) || {}) as AddTestCasesToTestPlanFormData,
  );

  const inputRefFunction = (node: HTMLInputElement) => {
    autompleteInputRef.current = node;
  };

  const setSelectedTestPlan = (value: TestPlanDto | null) => {
    change(SELECTED_TEST_PLAN_FIELD_NAME, value || null);
    autompleteInputRef.current?.blur();
  };

  const getTestCases = async (): Promise<{ testCaseIds: number[]; count: number } | null> => {
    if (isFromFolder) {
      setIsFetchingTestCases(true);

      try {
        const testCases = await fetchAllTestCases(projectKey, {
          'filter.in.testFolderId': getAllSubfolderIds(folderId, folders).join(','),
          offset: 0,
          limit: 50,
        });
        const testCaseIds = testCases.map(({ id }) => id);

        return {
          testCaseIds,
          count: testCaseIds.length,
        };
      } catch {
        showErrorNotification({
          messageId:
            itemCount === 1 ? 'testCaseAddingToTestPlanFailed' : 'testCasesAddingToTestPlanFailed',
        });

        return null;
      } finally {
        setIsFetchingTestCases(false);
      }
    }

    return {
      testCaseIds: selectedTestCaseIds || [],
      count: selectedTestCaseIds?.length || 0,
    };
  };

  const addTestCasesToTestPlan = async (values: AddTestCasesToTestPlanFormData): Promise<void> => {
    const testPlan = values?.[SELECTED_TEST_PLAN_FIELD_NAME];
    const testCases = await getTestCases();

    if (!testCases) {
      return;
    }

    const { testCaseIds, count } = testCases;

    if (isEmpty(testCaseIds)) {
      return;
    }

    const isSingleTestCaseMode = count === 1;

    const addToTestPlanCondition = isSingleTestCaseMode
      ? ADD_TO_TEST_PLAN_CONDITION.SINGLE
      : ADD_TO_TEST_PLAN_CONDITION.BULK;

    const fetchPath = (
      URLS.testPlanTestCasesBatch as (projectKey: string, testPlanId: number) => string
    )(projectKey, testPlan.id);

    showSpinner();

    fetch(fetchPath, {
      method: 'post',
      data: {
        testCaseIds,
      },
    })
      .then(() => {
        trackEvent(TEST_CASE_LIBRARY_EVENTS.submitAddToTestPlan(addToTestPlanCondition));
        dispatch(hideModalAction());
        showSuccessNotification({
          messageId: isSingleTestCaseMode
            ? 'testCaseAddingToTestPlanSuccess'
            : 'testCasesAddingToTestPlanSuccess',
        });
      })
      .catch((error) => {
        showErrorNotification({
          messageId: isSingleTestCaseMode
            ? 'testCaseAddingToTestPlanFailed'
            : 'testCasesAddingToTestPlanFailed',
        });
        console.error(error);
      })
      .finally(() => {
        hideSpinner();
      });
  };

  return {
    isAddTestCasesToTestPlanLoading: isAddTestCasesToTestPlanLoading || isFetchingTestCases,
    selectedTestPlan,
    addTestCasesToTestPlan,
    setSelectedTestPlan,
    inputRefFunction,
  };
};
