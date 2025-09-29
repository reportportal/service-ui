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

import { reduxForm } from 'redux-form';
import { messages } from './messages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { useSelector } from 'react-redux';
import { projectKeySelector } from 'controllers/project';
import { useMemo } from 'react';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';
import styles from './addTestCasesToTestPlanModal.module.scss';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useAddTestCasesToTestPlan } from './useAddTestCasesToTestPlan';
import { AsyncAutocomplete } from 'componentLibrary/autocompletes/asyncAutocomplete';
import { TestPlanDto } from 'controllers/testPlan';
import { hideModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';

const cx = classNames.bind(styles) as typeof classNames;

export const ADD_TO_TEST_PLAN_MODAL_KEY = 'addToTestPlanModalKey';

export const AddTestCasesToTestPlanModal = reduxForm<unknown, { selectedTestCaseIds: number[] }>({
  form: 'add-to-test-plan-modal-form',
})(({ selectedTestCaseIds }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectKey = useSelector(projectKeySelector);

  const selectedTestCasesLength = selectedTestCaseIds?.length || 0;

  const {
    isAddTestCasesToTestPlanLoading,
    setSelectedTestPlan,
    selectedTestPlan,
    addTestCasesToTestPlan,
  } = useAddTestCasesToTestPlan({
    selectedTestCaseIds,
  });

  const makeTestPlansOptions = (response: { content: TestPlanDto[] }) => response.content;

  const description = useMemo(() => {
    return (
      <p className={cx('description')}>
        <span>{formatMessage(messages.descriptionStart)}</span>
        <b className={cx('selected-test-cases')}>{selectedTestCasesLength}</b>
        <span>
          {formatMessage(
            selectedTestCasesLength > 1
              ? messages.addSelectedTestCases
              : messages.addSelectedTestCase,
          )}
        </span>
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
        onClick: () => addTestCasesToTestPlan(),
        disabled: !selectedTestPlan,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        onClick: () => hideModalAction(),
      }}
    >
      <div>
        {description}
        <div className={cx('autocomplete-wrapper')}>
          <AsyncAutocomplete
            placeholder={formatMessage(messages.selectedTestPlanPlaceholder)}
            getURI={retrieveTestPlans}
            value={selectedTestPlan}
            getRequestParams={() => {}}
            makeOptions={makeTestPlansOptions}
            onChange={setSelectedTestPlan}
            parseValueToString={(value: TestPlanDto) => value?.name}
            getUniqKey={(value: TestPlanDto) => value?.id}
            createWithoutConfirmation={false}
          />
        </div>
      </div>
    </Modal>
  );
});
