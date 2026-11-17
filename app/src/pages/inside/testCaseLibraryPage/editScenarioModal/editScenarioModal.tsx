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
import { useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, getFormInitialValues } from 'redux-form';

import {
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_PLACE,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { UseModalData } from 'common/hooks';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData } from '../types';
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
import { EditScenarioModalContent } from './editScenarioModalContent';
import { EDIT_SCENARIO_MODAL_KEY, EDIT_SCENARIO_FORM_NAME } from './constants';
import { EditScenarioModalProps } from './types';

const EditScenarioModalComponent = ({
  data,
  initialize,
  pristine,
  invalid,
  reset,
  handleSubmit,
}: UseModalData<EditScenarioModalProps> &
  InjectedFormProps<CreateTestCaseFormData, EditScenarioModalProps>) => {
  const testCase = data?.testCase;

  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { isLoading: isEditTestCaseLoading, editTestCase } = useTestCase(testCase?.id);
  const initialFormValues = useSelector(
    getFormInitialValues(EDIT_SCENARIO_FORM_NAME),
  ) as CreateTestCaseFormData | undefined;

  const { isInitialized } = useTestCaseFormInitialization({
    testCase,
    initialize,
    reset,
  });

  const handleUpdate = useCallback(
    async (formData: CreateTestCaseFormData): Promise<void> => {
      const response = await editTestCase(formData, testCase?.testFolder?.id, true);

      if (response && testCase?.id) {
        trackEvent(
          TEST_CASE_LIBRARY_EVENTS.submitEditTestCase({
            testCaseId: String(testCase.id),
            iconName: getTestCaseTemplateIcon(formData),
            condition: getTestCaseTimeCondition(formData),
            number: getTestCaseNumber(formData),
            status: getTestCaseAttachmentStatus(formData),
            editedFields: getEditedFieldsParam(initialFormValues ?? formData, formData),
            place: TEST_CASE_PLACE.DETAILS_PAGE,
          }),
        );
      }
    },
    [editTestCase, testCase, trackEvent, initialFormValues],
  );

  const isSaveDisabled = !isInitialized || pristine || invalid;

  return (
    <EditScenarioModalContent
      pristine={isSaveDisabled}
      allowCloseOutside={isInitialized && pristine}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.editScenario)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      isLoading={isEditTestCaseLoading}
      onSubmitHandler={handleUpdate}
      formName={EDIT_SCENARIO_FORM_NAME}
    />
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, EditScenarioModalProps>({
  form: EDIT_SCENARIO_FORM_NAME,
  initialValues: TEST_CASE_FORM_INITIAL_VALUES,
  enableReinitialize: false,
  destroyOnUnmount: true,
})(EditScenarioModalComponent);

export const EditScenarioModal = withModal(EDIT_SCENARIO_MODAL_KEY)(ReduxFormComponent);
