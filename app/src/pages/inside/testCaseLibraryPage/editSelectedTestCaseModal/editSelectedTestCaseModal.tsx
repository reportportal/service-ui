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

import { useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { commonValidators } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

import { commonMessages } from '../commonMessages';
import { ExtendedTestCase, CreateTestCaseFormData, ManualScenarioType } from '../types';
import { convertStepsArrayToObject } from '../utils';
import { TestCaseModal } from '../createTestCaseModal/testCaseModal/testCaseModal';
import { useEditTestCase } from './useEditTestCase';

export const EDIT_SELECTED_TEST_CASE_MODAL_KEY = 'editSelectedTestCaseModalKey';
export const EDIT_TEST_CASE_FORM_NAME: string = 'edit-test-case-modal-form';

interface EditTestCaseModalProps extends InjectedFormProps<CreateTestCaseFormData> {
  data?: {
    testCase?: ExtendedTestCase;
  };
}

const EditTestCaseModalComponent = ({
  data,
  initialize,
  dirty,
  handleSubmit,
}: EditTestCaseModalProps) => {
  const testCase = data?.testCase;

  const { formatMessage } = useIntl();
  const { isEditTestCaseLoading, editTestCase } = useEditTestCase(testCase?.id);

  useEffect(() => {
    if (testCase) {
      const manualScenario = testCase?.manualScenario;
      const stepsObject = convertStepsArrayToObject(manualScenario?.steps);

      const formData = {
        name: testCase.name,
        description: testCase.description,
        folder: testCase.testFolder,
        priority: (testCase.priority?.toLowerCase() || 'unspecified') as TestCasePriority,
        tags: testCase.tags?.map((tag: { key: string }) => tag.key),
        manualScenarioType: manualScenario?.manualScenarioType || ManualScenarioType.STEPS,
        executionEstimationTime: manualScenario?.executionEstimationTime || 5,
        linkToRequirements: manualScenario?.linkToRequirements,
        precondition: manualScenario?.preconditions?.value,
        preconditionAttachments: manualScenario?.preconditions?.attachments || [],
        ...(stepsObject && {
          steps: stepsObject,
        }),
      };

      initialize({ ...formData } as unknown as Partial<CreateTestCaseFormData>);
    }
  }, [testCase, initialize]);

  const handleUpdate = useCallback(
    (formData: CreateTestCaseFormData) => {
      return editTestCase(formData, testCase?.testFolder?.id);
    },
    [editTestCase, testCase?.testFolder?.id],
  );

  return (
    <TestCaseModal
      dirty={dirty}
      handleSubmit={handleSubmit}
      title={formatMessage(commonMessages.editTestCase)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      isLoading={isEditTestCaseLoading}
      onSubmitHandler={handleUpdate}
      formName={EDIT_TEST_CASE_FORM_NAME}
    />
  );
};

const ReduxFormComponent = reduxForm<CreateTestCaseFormData, EditTestCaseModalProps>({
  form: EDIT_TEST_CASE_FORM_NAME,
  initialValues: {
    priority: 'unspecified',
    manualScenarioType: ManualScenarioType.STEPS,
    executionEstimationTime: 5,
  },
  validate: ({ name, folder, linkToRequirements }) => ({
    name: commonValidators.requiredField(name),
    folder: commonValidators.requiredField(folder),
    linkToRequirements: commonValidators.optionalUrl(linkToRequirements),
  }),
  enableReinitialize: false,
})(EditTestCaseModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EditSelectedTestCaseModal = withModal(EDIT_SELECTED_TEST_CASE_MODAL_KEY)(
  ReduxFormComponent,
);
