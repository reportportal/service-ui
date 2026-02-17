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
import { InjectedFormProps, reduxForm } from 'redux-form';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
} from 'pages/inside/common/launchFormFields';

import { AddTestCasesToLaunchModalProps } from './types';
import { messages } from './messages';

import styles from './addTestCasesToLaunchModal.scss';

const cx = createClassnames(styles);

const BoldTestCasesCount = (parts: ReactNode[]) => (
  <b className={cx('selected-test-cases')}>{parts}</b>
);

const AddTestCasesToLaunchModalComponent = ({
  selectedRowsIds,
  testCases: allTestCases,
  testPlanId,
  testPlanName,
  onClearSelection,
  ...reduxFormProps
}: AddTestCasesToLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();

  const testCases: ExtendedTestCase[] = useMemo(() => {
    return allTestCases.filter((testCase) => selectedRowsIds.includes(testCase.id));
  }, [allTestCases, selectedRowsIds]);

  const descriptionText = useMemo(() => {
    return formatMessage(messages.addSelectedTestCases, {
      count: selectedRowsIds.length,
      bold: BoldTestCasesCount,
    });
  }, [selectedRowsIds.length, formatMessage]);

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      testPlanId={Number(testPlanId)}
      testPlanName={testPlanName}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      isTestPlanFieldDisabled={true}
      className={cx('add-test-cases-to-launch-modal')}
      onClearSelection={onClearSelection}
    />
  );
};

export const AddTestCasesToLaunchModal = reduxForm<LaunchFormData, AddTestCasesToLaunchModalProps>({
  form: 'add-test-cases-to-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddTestCasesToLaunchModalComponent);
