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

import { buildCreateManualLaunchDto } from './useCreateManualLaunch';
import { LaunchFormData } from './types';

const formValues: LaunchFormData = {
  name: 'it2 launch',
  description: 'Regression run',
  attributes: [
    { key: 'os', value: 'linux' },
    { key: 'browser', value: '' },
    { value: 'no-key' },
  ],
};

describe('buildCreateManualLaunchDto', () => {
  it('sends the Test Plan and no test cases when a launch is created from the list', () => {
    const dto = buildCreateManualLaunchDto({ formValues, testCaseIds: [], testPlanId: 17 });

    expect(dto).toMatchObject({
      name: 'it2 launch',
      description: 'Regression run',
      mode: 'DEFAULT',
      testCaseIds: [],
      testPlan: { id: 17 },
      attributes: [{ key: 'os', value: 'linux' }],
    });
    expect(dto.uuid).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(dto.startTime))).toBe(false);
  });

  it('omits the Test Plan when none is selected', () => {
    const dto = buildCreateManualLaunchDto({ formValues, testCaseIds: [], testPlanId: undefined });

    expect(dto).not.toHaveProperty('testPlan');
  });

  it('sends an empty name when the name is not a string', () => {
    const dto = buildCreateManualLaunchDto({
      formValues: { ...formValues, name: { id: 1, name: 'existing' } },
      testCaseIds: [1],
    });

    expect(dto.name).toBe('');
  });
});
