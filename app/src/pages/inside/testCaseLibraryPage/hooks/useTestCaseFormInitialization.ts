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

import { useEffect, useState } from 'react';
import { keyBy } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

import { uniqueId } from 'common/utils';

import { ExtendedTestCase, CreateTestCaseFormData, hasTagShape } from '../types';
import { TEST_CASE_FORM_INITIAL_VALUES } from '../createTestCaseModal/constants';

interface UseTestCaseFormInitializationParams {
  testCase?: ExtendedTestCase;
  initialize: (values: Partial<CreateTestCaseFormData>) => void;
}

export const useTestCaseFormInitialization = ({
  testCase,
  initialize,
}: UseTestCaseFormInitializationParams) => {
  const [isInitialized, setIsInitialized] = useState(false);

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
        priority: (testCase.priority?.toLowerCase() ?? TEST_CASE_FORM_INITIAL_VALUES.priority) as
          | 'low'
          | 'medium'
          | 'high'
          | 'blocker'
          | 'critical'
          | 'unspecified',
        attributes: (testCase.attributes ?? []).filter(hasTagShape).map(({ id, key, value }) => ({
          id,
          key,
          value: value ?? '',
        })),
        manualScenarioType:
          manualScenario?.manualScenarioType ?? TEST_CASE_FORM_INITIAL_VALUES.manualScenarioType,
        executionEstimationTime:
          manualScenario?.executionEstimationTime ??
          TEST_CASE_FORM_INITIAL_VALUES.executionEstimationTime,
        requirements: isEmpty(manualScenario?.requirements)
          ? [{ id: uniqueId(), value: '' }]
          : manualScenario?.requirements,
        precondition: manualScenario?.preconditions?.value,
        preconditionAttachments: manualScenario?.preconditions?.attachments ?? [],
        instructions: manualScenario?.instructions,
        expectedResult: manualScenario?.expectedResult,
        textAttachments: manualScenario?.attachments ?? [],
        ...(stepsObject && {
          steps: stepsObject,
        }),
      };

      initialize({ ...formData } as unknown as Partial<CreateTestCaseFormData>);

      // Set initialized state asynchronously to avoid React warning about setState in effect
      const timeoutId = setTimeout(() => {
        setIsInitialized(true);
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [testCase, initialize]);

  return { isInitialized };
};
