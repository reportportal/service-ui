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

import { useRef } from 'react';
import { getFormValues, InjectedFormProps } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { TestPlanDto } from 'controllers/testPlan';

import {
  AddTestCasesToTestPlanFormData,
  AddTestCasesToTestPlanModalData,
  AddTestCasesToTestPlanModalProps,
} from './types';
import {
  ADD_TO_TEST_PLAN_MODAL_FORM,
  SELECTED_TEST_PLAN_FIELD_NAME,
} from './addTestCasesToTestPlanModal';

export const useAddTestCasesToTestPlan = ({
  selectedTestCaseIds,
  isSingleTestCaseMode,
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
  const projectKey = useSelector(projectKeySelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const autompleteInputRef = useRef<HTMLInputElement>(null);

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

  const addTestCasesToTestPlan = (values: AddTestCasesToTestPlanFormData): void => {
    const testPlan = values?.[SELECTED_TEST_PLAN_FIELD_NAME];

    const fetchPath = (
      URLS.testPlanTestCasesBatch as (projectKey: string, testPlanId: number) => string
    )(projectKey, testPlan.id);

    showSpinner();

    fetch(fetchPath, {
      method: 'post',
      data: {
        testCaseIds: selectedTestCaseIds,
      },
    })
      .then(() => {
        dispatch(hideModalAction());
        showSuccessNotification({
          messageKey: isSingleTestCaseMode
            ? 'testCaseAddingToTestPlanSuccess'
            : 'testCasesAddingToTestPlanSuccess',
        });
      })
      .catch((error) => {
        showErrorNotification({
          messageKey: isSingleTestCaseMode
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
    isAddTestCasesToTestPlanLoading,
    selectedTestPlan,
    addTestCasesToTestPlan,
    setSelectedTestPlan,
    inputRefFunction,
  };
};
