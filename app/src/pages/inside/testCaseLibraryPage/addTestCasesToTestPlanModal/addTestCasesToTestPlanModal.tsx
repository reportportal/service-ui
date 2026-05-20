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

import { ComponentProps, ReactNode, useCallback, useMemo, useState } from 'react';
import { noop } from 'es-toolkit';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm, SubmitHandler } from 'redux-form';

import { FieldLabel, Modal, SingleAutocomplete } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { commonValidators } from 'common/utils/validation';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { hideModalAction, withModal } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import type { TestPlanDto } from 'controllers/testPlan/types';

import { ADD_TO_TEST_PLAN_MODAL_FORM } from './constants';
import { filterTestPlansByName } from './fetchMilestoneTestPlans';
import { messages } from './messages';
import { AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps } from './types';
import { useAddTestCasesToTestPlan } from './useAddTestCasesToTestPlan';
import { useLaunchTestPlansForAddModal } from './useLaunchTestPlansForAddModal';

import styles from './addTestCasesToTestPlanModal.module.scss';

type AddTestCasesSubmitHandler = SubmitHandler<
  AddTestCasesToTestPlanFormData,
  AddTestCasesToTestPlanModalProps
>;

type TestPlanAutocompleteStateChange = ComponentProps<
  typeof SingleAutocomplete<TestPlanDto>
>['onStateChange'];

const cx = createClassnames(styles);

export const ADD_TO_TEST_PLAN_MODAL_KEY = 'addToTestPlanModalKey';

export const AddTestCasesToTestPlanModal = ({
  change,
  handleSubmit,
  data: { folderId, itemCount, selectedTestCaseIds },
  invalid,
}: AddTestCasesToTestPlanModalProps &
  InjectedFormProps<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const [testPlanSearchInput, setTestPlanSearchInput] = useState('');
  const { launchTestPlans, isLaunchTestPlansLoading } =
    useLaunchTestPlansForAddModal(projectKey);

  const isFromFolder = folderId && !selectedTestCaseIds;
  const testCaseCount = isFromFolder ? itemCount : selectedTestCaseIds?.length || 0;

  const {
    isAddTestCasesToTestPlanLoading,
    selectedTestPlan,
    setSelectedTestPlan,
    addTestCasesToTestPlan,
    inputRefFunction,
  } = useAddTestCasesToTestPlan({
    folderId,
    itemCount,
    selectedTestCaseIds,
    change,
  });

  const filteredTestPlans = useMemo(
    () => filterTestPlansByName(launchTestPlans, testPlanSearchInput),
    [launchTestPlans, testPlanSearchInput],
  );

  const handleTestPlanAutocompleteStateChange: TestPlanAutocompleteStateChange = useCallback(
    (changes) => {
      if (changes.inputValue !== undefined) {
        setTestPlanSearchInput(changes.inputValue || '');
      }
    },
    [],
  );

  const description = useMemo(
    () => (
      <p className={cx('description')}>
        {formatMessage(messages.description, {
          testPlansQuantity: testCaseCount,
          bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
        })}
      </p>
    ),
    [formatMessage, testCaseCount],
  );

  return (
    <Modal
      title={formatMessage(COMMON_LOCALE_KEYS.ADD_TO_TEST_PLAN)}
      onClose={() => dispatch(hideModalAction())}
      okButton={{
        children: (
          <LoadingSubmitButton isLoading={isAddTestCasesToTestPlanLoading}>
            {formatMessage(COMMON_LOCALE_KEYS.ADD)}
          </LoadingSubmitButton>
        ),
        type: 'submit',
        onClick: handleSubmit(addTestCasesToTestPlan) as AddTestCasesSubmitHandler,
        disabled: invalid || !selectedTestPlan || isAddTestCasesToTestPlanLoading,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => dispatch(hideModalAction()),
      }}
    >
      <form onSubmit={handleSubmit(addTestCasesToTestPlan) as AddTestCasesSubmitHandler}>
        <div>
          {testCaseCount > 1 && description}
          <div className={cx('autocomplete-wrapper')}>
            <FieldLabel>{formatMessage(COMMON_LOCALE_KEYS.TEST_PLAN_LABEL)}</FieldLabel>
            <SingleAutocomplete<TestPlanDto>
              value={selectedTestPlan ?? undefined}
              placeholder={formatMessage(COMMON_LOCALE_KEYS.SELECT_TEST_PLAN_PLACEHOLDER)}
              options={filteredTestPlans}
              loading={isLaunchTestPlansLoading}
              onChange={setSelectedTestPlan}
              refFunction={inputRefFunction}
              isDropdownMode
              parseValueToString={(value: TestPlanDto) => value?.name}
              getUniqKey={(value: TestPlanDto) => String(value?.id)}
              createWithoutConfirmation
              skipOptionCreation
              onStateChange={handleTestPlanAutocompleteStateChange}
              useFixedPositioning={false}
              onFocus={noop}
              onBlur={noop}
              error={undefined}
              touched={false}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default withModal(ADD_TO_TEST_PLAN_MODAL_KEY)(
  reduxForm<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>({
    form: ADD_TO_TEST_PLAN_MODAL_FORM,
    destroyOnUnmount: true,
    validate: ({ selectedTestPlan }) => ({
      selectedTestPlan: commonValidators.requiredField(selectedTestPlan),
    }),
  })(AddTestCasesToTestPlanModal),
);
