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

import { useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { keyBy } from 'es-toolkit';

import { commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { UseModalData } from 'common/hooks';

import { commonMessages } from '../commonMessages';
import { ExtendedTestCase, CreateTestCaseFormData } from '../types';
import { TestCaseModal } from '../createTestCaseModal/testCaseModal/testCaseModal';
import { useTestCase } from '../createTestCaseModal/useTestCase';
import { TEST_CASE_FORM_INITIAL_VALUES } from '../createTestCaseModal/constants';

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
  reset,
}: UseModalData<EditTestCaseModalProps> &
  InjectedFormProps<CreateTestCaseFormData, EditTestCaseModalProps>) => {
  const testCase = data?.testCase;
  const [isInitialized, setIsInitialized] = useState(false);

  const { formatMessage } = useIntl();
  const { isLoading: isEditTestCaseLoading, editTestCase } = useTestCase(testCase?.id);

  useEffect(() => {
    if (testCase) {
      const manualScenario = testCase?.manualScenario;
      const stepsObject = manualScenario?.steps
        ? keyBy(
            manualScenario.steps.map((step, index) => ({ ...step, position: index })),
            (step) => step.id,
          )
        : undefined;

      const formData = {
        name: testCase.name,
        description: testCase.description,
        folder: testCase.testFolder,
        priority: (testCase.priority?.toLowerCase() ||
          TEST_CASE_FORM_INITIAL_VALUES.priority) as TestCasePriority,
        attributes: (testCase.attributes ?? []).map(({ id, key, value }) => ({
          id,
          key,
          value: value ?? '',
        })),
        manualScenarioType:
          manualScenario?.manualScenarioType || TEST_CASE_FORM_INITIAL_VALUES.manualScenarioType,
        executionEstimationTime:
          manualScenario?.executionEstimationTime ||
          TEST_CASE_FORM_INITIAL_VALUES.executionEstimationTime,
        linkToRequirements: manualScenario?.linkToRequirements,
        precondition: manualScenario?.preconditions?.value,
        preconditionAttachments: manualScenario?.preconditions?.attachments || [],
        instructions: manualScenario?.instructions,
        expectedResult: manualScenario?.expectedResult,
        textAttachments: manualScenario?.attachments || [],
        ...(stepsObject && {
          steps: stepsObject,
        }),
      };

      initialize({ ...formData } as unknown as Partial<CreateTestCaseFormData>);

      // Delay reset() to ensure form is fully initialized before resetting pristine state
      setTimeout(() => {
        reset();
        setIsInitialized(true);
      }, 100);
    }
  }, [testCase, initialize, reset]);

  const handleUpdate = useCallback(
    (formData: CreateTestCaseFormData) => {
      return editTestCase(formData, testCase?.testFolder?.id);
    },
    [editTestCase, testCase?.testFolder?.id],
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
  validate: ({ name, linkToRequirements }) => ({
    name: commonValidators.requiredField(name),
    linkToRequirements: commonValidators.optionalUrl(linkToRequirements),
  }),
  enableReinitialize: false,
})(EditTestCaseModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EditSelectedTestCaseModal = withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(
  ReduxFormComponent,
);
