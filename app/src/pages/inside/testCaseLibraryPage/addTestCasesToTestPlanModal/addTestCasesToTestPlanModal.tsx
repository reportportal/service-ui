/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

import classNames from 'classnames/bind';
import { size } from 'es-toolkit/compat';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useIntl } from 'react-intl';

import { Modal } from '@reportportal/ui-kit';

import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { messages } from './messages';
import { projectKeySelector } from 'controllers/project';
import { TestPlanDto } from 'controllers/testPlan';
import { URLS } from 'common/urls';

import { AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps } from './types';
import { useAddTestCasesToTestPlan } from './useAddTestCasesToTestPlan';

import styles from './addTestCasesToTestPlanModal.module.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const ADD_TO_TEST_PLAN_MODAL_KEY = 'addToTestPlanModalKey';
export const ADD_TO_TEST_PLAN_MODAL_FORM = 'add-to-test-plan-form';
export const SELECTED_TEST_PLAN_FIELD_NAME = 'selectedTestPlan';

export const AddTestCasesToTestPlanModal = ({
  change,
  handleSubmit,
  data,
}: AddTestCasesToTestPlanModalProps &
  InjectedFormProps<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>) => {
  const { selectedTestCaseIds } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectKey = useSelector(projectKeySelector);

  const selectedTestCasesLength = size(selectedTestCaseIds);

  const {
    isAddTestCasesToTestPlanLoading,
    setSelectedTestPlan,
    selectedTestPlan,
    addTestCasesToTestPlan,
  } = useAddTestCasesToTestPlan({
    selectedTestCaseIds,
    change,
  });

  const makeTestPlansOptions = (response: { content: TestPlanDto[] }) => response.content;

  const description = useMemo(() => {
    return (
      <p className={cx('description')}>
        {formatMessage(messages.description, {
          testPlansQuantity: <b className={cx('selected-test-cases')}>{selectedTestCasesLength}</b>,
        })}
      </p>
    );
  }, [formatMessage, selectedTestCasesLength]);

  const retrieveTestPlans = () => URLS.testPlan(projectKey);

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
        onClick: handleSubmit(addTestCasesToTestPlan),
        disabled: !selectedTestPlan,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => hideModalAction(),
      }}
    >
      <form onSubmit={handleSubmit(addTestCasesToTestPlan)}>
        <div>
          {description}
          <div className={cx('autocomplete-wrapper')}>
            <AsyncAutocomplete
              placeholder={formatMessage(messages.selectedTestPlanPlaceholder)}
              getURI={retrieveTestPlans}
              value={selectedTestPlan}
              makeOptions={makeTestPlansOptions}
              onChange={setSelectedTestPlan}
              parseValueToString={(value: TestPlanDto) => value?.name}
              getUniqKey={(value: TestPlanDto) => value?.id}
              createWithoutConfirmation={false}
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
    shouldValidate: () => true, // need this to force validation on destinationFolderName after re-registering it
    validate: ({ selectedTestPlan }) => ({
      selectedTestPlan: commonValidators.requiredField(selectedTestPlan),
    }),
  })(AddTestCasesToTestPlanModal),
);
