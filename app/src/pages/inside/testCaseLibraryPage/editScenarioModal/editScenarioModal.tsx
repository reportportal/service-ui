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

import { useEffect, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { keyBy } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

import { uniqueId } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'controllers/modal';
import { UseModalData } from 'common/hooks';

import { commonMessages } from '../commonMessages';
import { CreateTestCaseFormData, hasTagShape } from '../types';
import { TEST_CASE_FORM_INITIAL_VALUES } from '../createTestCaseModal/constants';
import { useTestCase } from '../hooks/useTestCase';
import { EditScenarioModalContent } from './editScenarioModalContent';
import { EDIT_SCENARIO_MODAL_KEY, EDIT_SCENARIO_FORM_NAME } from './constants';
import { EditScenarioModalProps } from './types';

const EditScenarioModalComponent = ({
  data,
  initialize,
  pristine,
  handleSubmit,
  reset,
}: UseModalData<EditScenarioModalProps> &
  InjectedFormProps<CreateTestCaseFormData, EditScenarioModalProps>) => {
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
        priority: (testCase.priority?.toLowerCase() || TEST_CASE_FORM_INITIAL_VALUES.priority) as
          | 'low'
          | 'medium'
          | 'high',
        attributes: (testCase.attributes ?? []).filter(hasTagShape).map(({ id, key, value }) => ({
          id,
          key,
          value: value ?? '',
        })),
        manualScenarioType:
          manualScenario?.manualScenarioType || TEST_CASE_FORM_INITIAL_VALUES.manualScenarioType,
        executionEstimationTime:
          manualScenario?.executionEstimationTime ||
          TEST_CASE_FORM_INITIAL_VALUES.executionEstimationTime,
        requirements: isEmpty(manualScenario?.requirements)
          ? [{ id: uniqueId(), value: '' }]
          : manualScenario?.requirements,
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

      setTimeout(() => {
        reset();
        setIsInitialized(true);
      }, 100);
    }
  }, [testCase, initialize, reset]);

  const handleUpdate = useCallback(
    (formData: CreateTestCaseFormData) => {
      return editTestCase(formData, testCase?.testFolder?.id, true);
    },
    [editTestCase, testCase],
  );

  return (
    <EditScenarioModalContent
      pristine={!isInitialized || pristine}
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
  validate: () => ({}),
  enableReinitialize: false,
})(EditScenarioModalComponent);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const EditScenarioModal = withModal(EDIT_SCENARIO_MODAL_KEY)(ReduxFormComponent);
