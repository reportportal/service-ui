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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { TEST_CASE_LIBRARY_EVENTS } from 'analyticsEvents/testCaseLibraryPageEvents';
import { commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { UseModalData } from 'common/hooks';
import { ExtendedTestCase } from 'types/testCase';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData } from '../types';
import { TestCaseModal } from '../createTestCaseModal/testCaseModal/testCaseModal';
import { TEST_CASE_FORM_INITIAL_VALUES } from '../createTestCaseModal/constants';
import { useTestCase } from '../hooks/useTestCase';
import { useTestCaseFormInitialization } from '../hooks/useTestCaseFormInitialization';

export const DUPLICATE_SELECTED_TEST_CASE_MODAL_KEY = 'duplicateSelectedTestCaseModalKey';
export const DUPLICATE_SELECTED_TEST_CASE_FORM_NAME = 'duplicate-selected-test-case-modal-form';

interface DuplicateSelectedTestCaseModalProps {
  testCase?: ExtendedTestCase;
}

const DuplicateSelectedTestCaseModal = reduxForm<
  CreateTestCaseFormData,
  DuplicateSelectedTestCaseModalProps
>({
  form: DUPLICATE_SELECTED_TEST_CASE_FORM_NAME,
  initialValues: TEST_CASE_FORM_INITIAL_VALUES,
  enableReinitialize: false,
  validate: ({ name, folder }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
  }),
})(({
  data,
  initialize,
  handleSubmit,
}: UseModalData<DuplicateSelectedTestCaseModalProps> &
  InjectedFormProps<CreateTestCaseFormData, DuplicateSelectedTestCaseModalProps>) => {
  const testCase = data?.testCase;

  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { isLoading: isCreateTestCaseLoading, createTestCase } = useTestCase();

  const initializeWithNameSuffix = useCallback(
    (values: Partial<CreateTestCaseFormData>) => {
      initialize({ ...values, name: `${testCase?.name ?? ''} (1)` });
    },
    [initialize, testCase?.name],
  );

  const { isInitialized } = useTestCaseFormInitialization({
    testCase,
    initialize: initializeWithNameSuffix,
  });

  const handleDuplicate = useCallback(
    async (formData: CreateTestCaseFormData): Promise<void> => {
      const response = await createTestCase(formData, {
        successMessageId: 'testCaseDuplicatedSuccess',
      });
      if (response?.id) {
        trackEvent(TEST_CASE_LIBRARY_EVENTS.submitDuplicateTestCase(String(response.id)));
      }
    },
    [createTestCase, trackEvent],
  );

  return (
    <TestCaseModal
      pristine={!isInitialized}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.duplicateTestCase)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.DUPLICATE)}
      isLoading={isCreateTestCaseLoading}
      onSubmitHandler={handleDuplicate}
      formName={DUPLICATE_SELECTED_TEST_CASE_FORM_NAME}
    />
  );
});

export default withModal(DUPLICATE_SELECTED_TEST_CASE_MODAL_KEY)(DuplicateSelectedTestCaseModal);
