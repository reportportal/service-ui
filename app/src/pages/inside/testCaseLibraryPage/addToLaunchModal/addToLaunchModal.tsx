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

import { useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { testCasesSelector } from 'controllers/testCase';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
} from 'pages/inside/common/launchFormFields';

import { AddToLaunchModalProps } from './types';
import { messages } from './messages';

import styles from './addToLaunchModal.scss';

const cx = createClassnames(styles);

const BoldTestCasesCount = (parts: ReactNode[]) => (
  <b className={cx('selected-test-cases')}>{parts}</b>
);

const AddToLaunchModalComponent = ({
  selectedTestCasesIds,
  onClearSelection,
  isUncoveredTestsCheckboxAvailable,
  ...reduxFormProps
}: AddToLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();
  const allTestCases = useSelector(testCasesSelector);

  const testCases = useMemo(() => {
    return allTestCases.filter((testCase) => selectedTestCasesIds.includes(testCase.id));
  }, [allTestCases, selectedTestCasesIds]);

  const descriptionText = useMemo(() => {
    // Switch description text based on the number of selected test cases
    return selectedTestCasesIds.length > 1 ? formatMessage(messages.addSelectedTestCases, {
      count: selectedTestCasesIds.length,
      bold: BoldTestCasesCount,
    }) : formatMessage(messages.addSelectedTestCase, {
      testCaseName: testCases[0]?.name,
      bold: BoldTestCasesCount,
    });
  }, [selectedTestCasesIds.length, formatMessage]);

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      isTestPlanFieldDisabled={false}
      className={cx('add-to-launch-modal')}
      onClearSelection={onClearSelection}
      isUncoveredTestsCheckboxAvailable={isUncoveredTestsCheckboxAvailable}
    />
  );
};

export const AddToLaunchModal = reduxForm<LaunchFormData, AddToLaunchModalProps>({
  form: 'add-to-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddToLaunchModalComponent);
