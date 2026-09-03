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
import { useTracking } from 'react-tracking';
import { InjectedFormProps, reduxForm } from 'redux-form';

import {
  ADD_TO_LAUNCH_STATUS,
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_PLACE,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  BaseLaunchModal,
  LaunchFormData,
  LaunchMode,
  INITIAL_LAUNCH_FORM_VALUES,
} from 'pages/inside/common/launchFormFields';
import { testCaseDetailsSelector, testCasesSelector } from 'controllers/testCase';
import { ExtendedTestCase } from 'types/testCase';

import { AddToLaunchModalProps } from './types';
import { messages } from './messages';

import styles from './addToLaunchModal.scss';

const cx = createClassnames(styles);

const BoldTestCasesCount = (parts: ReactNode[]) => (
  <b className={cx('selected-test-cases')}>{parts}</b>
);

const resolveSelectedTestCases = ({
  selectedTestCaseIds,
  allTestCases,
  testCaseDetails,
}: {
  selectedTestCaseIds: number[];
  allTestCases: ExtendedTestCase[];
  testCaseDetails?: ExtendedTestCase | null;
}): ExtendedTestCase[] => {
  const testCasesById = new Map(allTestCases.map((testCase) => [testCase.id, testCase]));

  if (testCaseDetails?.id) {
    testCasesById.set(testCaseDetails.id, testCaseDetails);
  }

  return selectedTestCaseIds.map(
    (id) => testCasesById.get(id) ?? ({ id } as ExtendedTestCase),
  );
};

const AddToLaunchModalComponent = ({
  folderId,
  itemCount,
  selectedTestCaseIds,
  onClearSelection,
  isUncoveredTestsCheckboxAvailable,
  place,
  ...reduxFormProps
}: AddToLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const allTestCases = useSelector(testCasesSelector);
  const testCaseDetails = useSelector(testCaseDetailsSelector);

  const isFromFolder = folderId !== undefined;

  const testCases = useMemo(
    () =>
      isFromFolder
        ? []
        : resolveSelectedTestCases({
            selectedTestCaseIds: selectedTestCaseIds || [],
            allTestCases,
            testCaseDetails,
          }),
    [allTestCases, isFromFolder, selectedTestCaseIds, testCaseDetails],
  );

  const count = isFromFolder ? (itemCount ?? 0) : selectedTestCaseIds.length;
  const isBulk = count > 1;

  const descriptionText = useMemo(
    () =>
      isFromFolder || count > 1
        ? formatMessage(messages.addSelectedTestCases, {
            count,
            bold: BoldTestCasesCount,
          })
        : formatMessage(messages.addSelectedTestCase, {
            testCaseName: testCases?.[0]?.name,
            bold: BoldTestCasesCount,
          }),
    [count, isFromFolder, testCases, formatMessage],
  );

  const handleSubmitSuccess = (mode: LaunchMode) => {
    if (isBulk) {
      trackEvent(TEST_CASE_LIBRARY_EVENTS.SUBMIT_BULK_ADD_TO_LAUNCH);
      return;
    }

    if (place !== TEST_CASE_PLACE.SIDE_PANEL && place !== TEST_CASE_PLACE.DETAILS_PAGE) {
      return;
    }

    trackEvent(
      TEST_CASE_LIBRARY_EVENTS.submitSingleAddToLaunch({
        place,
        status:
          mode === LaunchMode.NEW
            ? ADD_TO_LAUNCH_STATUS.CREATE_NEW_LAUNCH
            : ADD_TO_LAUNCH_STATUS.ADD_TO_EXISTING_LAUNCH,
      }),
    );
  };

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      selectedTestCaseIds={isFromFolder ? undefined : selectedTestCaseIds}
      folderId={folderId}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      className={cx('add-to-launch-modal')}
      onClearSelection={onClearSelection}
      isUncoveredTestsCheckboxAvailable={isUncoveredTestsCheckboxAvailable}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};

export const AddToLaunchModal = reduxForm<LaunchFormData, AddToLaunchModalProps>({
  form: 'add-to-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddToLaunchModalComponent);
