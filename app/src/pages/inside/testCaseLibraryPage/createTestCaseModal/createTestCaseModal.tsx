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

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { TEST_CASE_LIBRARY_EVENTS } from 'analyticsEvents/testCaseLibraryPageEvents';
import { commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { FolderWithFullPath } from 'controllers/testCase';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData } from '../types';
import { TestCaseModal } from './testCaseModal/testCaseModal';
import { TEST_CASE_FORM_INITIAL_VALUES } from './constants';
import { useTestCase } from '../hooks/useTestCase';
import {
  getTestCaseAttachmentStatus,
  getTestCaseNumber,
  getTestCaseTemplateIcon,
  getTestCaseTimeCondition,
} from '../utils/getTestCaseAnalyticsParams';

export const CREATE_TEST_CASE_MODAL_KEY = 'createTestCaseModalKey';
export const CREATE_TEST_CASE_FORM_NAME: string = 'create-test-case-modal-form';

interface CreateTestCaseModalData {
  folder?: FolderWithFullPath;
}

interface CreateTestCaseModalOwnProps {
  data?: CreateTestCaseModalData;
}

type CreateTestCaseModalProps = CreateTestCaseModalOwnProps &
  InjectedFormProps<CreateTestCaseFormData, CreateTestCaseModalOwnProps>;

const CreateTestCaseModalComponent = ({
  data,
  pristine,
  initialize,
  handleSubmit,
}: CreateTestCaseModalProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { isLoading: isCreateTestCaseLoading, createTestCase } = useTestCase();

  useEffect(() => {
    initialize({ ...TEST_CASE_FORM_INITIAL_VALUES, folder: data?.folder });
  }, [data, initialize]);

  const handleCreate = useCallback(
    async (formData: CreateTestCaseFormData): Promise<void> => {
      const response = await createTestCase(formData);

      if (response?.id) {
        trackEvent(
          TEST_CASE_LIBRARY_EVENTS.submitCreateTestCase({
            testCaseId: String(response.id),
            iconName: getTestCaseTemplateIcon(formData),
            condition: getTestCaseTimeCondition(formData),
            number: getTestCaseNumber(formData),
            status: getTestCaseAttachmentStatus(formData),
          }),
        );
      }
    },
    [createTestCase, trackEvent],
  );

  return (
    <TestCaseModal
      pristine={pristine}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.createTestCase)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      isLoading={isCreateTestCaseLoading}
      onSubmitHandler={handleCreate}
      formName={CREATE_TEST_CASE_FORM_NAME}
    />
  );
};

export const CreateTestCaseModal = reduxForm<CreateTestCaseFormData, CreateTestCaseModalOwnProps>({
  form: CREATE_TEST_CASE_FORM_NAME,
  initialValues: TEST_CASE_FORM_INITIAL_VALUES,
  validate: ({ name, folder }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
  }),
  enableReinitialize: false,
})(CreateTestCaseModalComponent);
