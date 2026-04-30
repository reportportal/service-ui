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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, getFormInitialValues } from 'redux-form';

import {
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_PLACE,
} from 'analyticsEvents/testCaseLibraryPageEvents';
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
import {
  getEditedFieldsParam,
  getTestCaseAttachmentStatus,
  getTestCaseNumber,
  getTestCaseTemplateIcon,
  getTestCaseTimeCondition,
} from '../utils/getTestCaseAnalyticsParams';

export const EDIT_SELECTED_TEST_CASE_MODAL_KEY = 'editSelectedTestCaseModalKey';
export const EDIT_TEST_CASE_FORM_NAME: string = 'edit-test-case-modal-form';

interface EditTestCaseModalProps {
  testCase?: ExtendedTestCase;
}

const EditTestCaseModalComponent = ({
  data,
  initialize,
  pristine,
  handleSubmit,
}: UseModalData<EditTestCaseModalProps> &
  InjectedFormProps<CreateTestCaseFormData, EditTestCaseModalProps>) => {
  const testCase = data?.testCase;

  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { isLoading: isEditTestCaseLoading, editTestCase } = useTestCase(testCase?.id);
  const initialFormValues = useSelector(
    getFormInitialValues(EDIT_TEST_CASE_FORM_NAME),
  ) as CreateTestCaseFormData | undefined;

  const { isInitialized } = useTestCaseFormInitialization({
    testCase,
    initialize,
  });

  const handleUpdate = useCallback(
    async (formData: CreateTestCaseFormData): Promise<void> => {
      const response = await editTestCase(formData, testCase?.testFolder?.id);

      if (response && testCase?.id) {
        trackEvent(
          TEST_CASE_LIBRARY_EVENTS.submitEditTestCase({
            testCaseId: String(testCase.id),
            iconName: getTestCaseTemplateIcon(formData),
            condition: getTestCaseTimeCondition(formData),
            number: getTestCaseNumber(formData),
            status: getTestCaseAttachmentStatus(formData),
            editedFields: getEditedFieldsParam(initialFormValues ?? formData, formData),
            place: TEST_CASE_PLACE.SIDE_PANEL,
          }),
        );
      }
    },
    [editTestCase, testCase, trackEvent, initialFormValues],
  );

  return (
    <TestCaseModal
      pristine={!isInitialized || pristine}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.editTestCase)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      isLoading={isEditTestCaseLoading}
      onSubmitHandler={handleUpdate}
      formName={EDIT_TEST_CASE_FORM_NAME}
      hideFolderField
      isTemplateFieldDisabled
    />
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, EditTestCaseModalProps>({
  form: EDIT_TEST_CASE_FORM_NAME,
  initialValues: TEST_CASE_FORM_INITIAL_VALUES,
  validate: ({ name }) => ({
    name: commonValidators.requiredField(name),
  }),
  enableReinitialize: false,
})(EditTestCaseModalComponent);

 
export const EditSelectedTestCaseModal = withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(
  ReduxFormComponent,
);
