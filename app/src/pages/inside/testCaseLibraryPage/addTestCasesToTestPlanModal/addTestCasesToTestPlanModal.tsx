/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { ReactNode, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useIntl } from 'react-intl';

import { Modal } from '@reportportal/ui-kit';

import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { commonValidators } from 'common/utils/validation';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { projectKeySelector } from 'controllers/project';
import { TestPlanDto } from 'controllers/testPlan';
import { URLS } from 'common/urls';

import { messages } from './messages';
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
  invalid,
}: AddTestCasesToTestPlanModalProps &
  InjectedFormProps<AddTestCasesToTestPlanFormData, AddTestCasesToTestPlanModalProps>) => {
  const { selectedTestCaseIds } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectKey = useSelector(projectKeySelector);

  const selectedTestCasesLength = size(selectedTestCaseIds);

  const { isAddTestCasesToTestPlanLoading, setSelectedTestPlan, addTestCasesToTestPlan } =
    useAddTestCasesToTestPlan({
      selectedTestCaseIds,
      change,
    });

  const makeTestPlansOptions = (response: { content: TestPlanDto[] }) => response.content;

  const description = useMemo(() => {
    return (
      <p className={cx('description')}>
        {formatMessage(messages.description, {
          testPlansQuantity: selectedTestCasesLength,
          bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
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
        onClick: () => handleSubmit(addTestCasesToTestPlan),
        disabled: invalid,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => dispatch(hideModalAction()),
      }}
    >
      <form onSubmit={handleSubmit(addTestCasesToTestPlan)}>
        <div>
          {description}
          <div className={cx('autocomplete-wrapper')}>
            <AsyncAutocomplete
              placeholder={formatMessage(messages.selectedTestPlanPlaceholder)}
              getURI={retrieveTestPlans}
              makeOptions={makeTestPlansOptions}
              onChange={setSelectedTestPlan}
              parseValueToString={(value: TestPlanDto) => value?.name}
              createWithoutConfirmation={false}
              skipOptionCreation
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
