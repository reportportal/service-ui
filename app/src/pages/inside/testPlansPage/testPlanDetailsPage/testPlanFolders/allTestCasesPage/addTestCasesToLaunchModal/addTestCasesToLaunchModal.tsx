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

import { useMemo, ReactNode, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useTracking } from 'react-tracking';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { TestCase } from 'types/testCase';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
  LaunchMode,
} from 'pages/inside/common/launchFormFields';
import {
  TEST_PLANS_PAGE_EVENTS,
  ADD_TO_LAUNCH_STATUS,
} from 'analyticsEvents/testPlansPageEvents';

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
  onClearSelection,
  source,
  place,
  ...reduxFormProps
}: AddTestCasesToLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const testCases: TestCase[] = useMemo(() => {
    return allTestCases.filter((testCase) => selectedRowsIds.includes(testCase.id));
  }, [allTestCases, selectedRowsIds]);

  const descriptionText = useMemo(() => {
    // Switch description text based on the number of selected test cases
    return testCases.length !== 1
      ? formatMessage(messages.addSelectedTestCases, {
          count: testCases.length,
          bold: BoldTestCasesCount,
        })
      : formatMessage(messages.addSelectedTestCase, {
          testCaseName: testCases[0]?.name,
          bold: BoldTestCasesCount,
        });
  }, [testCases, formatMessage]);

  const handleSubmitClick = useCallback(
    (mode: LaunchMode) => {
      if (!source || !place) {
        return;
      }
      trackEvent(
        TEST_PLANS_PAGE_EVENTS.submitAddToTestLaunch({
          source,
          place,
          status:
            mode === LaunchMode.NEW
              ? ADD_TO_LAUNCH_STATUS.CREATE_NEW_LAUNCH
              : ADD_TO_LAUNCH_STATUS.ADD_TO_EXISTING_LAUNCH,
        }),
      );
    },
    [trackEvent, source, place],
  );

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      testPlanId={Number(testPlanId)}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      isUncoveredTestsCheckboxAvailable={false}
      hideTestPlanField
      className={cx('add-test-cases-to-launch-modal')}
      onClearSelection={onClearSelection}
      onSubmitClick={handleSubmitClick}
    />
  );
};

export const AddTestCasesToLaunchModal = reduxForm<LaunchFormData, AddTestCasesToLaunchModalProps>({
  form: 'add-test-cases-to-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddTestCasesToLaunchModalComponent);
