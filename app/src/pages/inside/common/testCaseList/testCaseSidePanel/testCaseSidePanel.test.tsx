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

import { ManualScenario, TestCaseManualScenario } from 'types/testCase';

import { COLLAPSIBLE_SECTIONS_CONFIG } from './testCaseSidePanel';

const getTitleKeys = (manualScenarioType: TestCaseManualScenario) =>
  COLLAPSIBLE_SECTIONS_CONFIG({
    attributes: [],
    scenario: { manualScenarioType, steps: [] } as unknown as ManualScenario,
    testCaseDescription: '',
    requirements: [],
  }).map(({ titleKey }) => titleKey);

describe('COLLAPSIBLE_SECTIONS_CONFIG', () => {
  it('places Description right after Tags for a step-based test case', () => {
    expect(getTitleKeys(TestCaseManualScenario.STEPS)).toEqual([
      'tags',
      'description',
      'requirements',
      'scenarioTitle',
    ]);
  });

  it('places Description right after Tags and Test case attachments last for a text-based test case', () => {
    expect(getTitleKeys(TestCaseManualScenario.TEXT)).toEqual([
      'tags',
      'description',
      'requirements',
      'scenarioTitle',
      'testCaseAttachments',
    ]);
  });
});
