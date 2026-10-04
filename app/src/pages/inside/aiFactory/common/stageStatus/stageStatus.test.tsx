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

import { shallow } from 'enzyme';
import { StageStatus } from 'types/aiFactory';
import { StageStatusDot } from './stageStatusDot';
import { StageStatusLabel } from './stageStatusLabel';

// jest.requireActual's generic defaults to `any` — the standard Jest idiom for partial mocks.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

describe('StageStatusDot', () => {
  test.each([
    [StageStatus.PENDING, 'pending'],
    [StageStatus.RUNNING, 'active'],
    [StageStatus.IN_PROGRESS, 'active'],
    [StageStatus.PASSED, 'done'],
    [StageStatus.DONE, 'done'],
    [StageStatus.FAILED, 'failed'],
    [StageStatus.SKIPPED, 'skipped'],
  ])('maps %s to the "%s" variant class', (status, variant) => {
    const wrapper = shallow(<StageStatusDot status={status} />);

    expect(wrapper.hasClass(variant)).toBe(true);
    expect(wrapper.prop('role')).toBe('img');
    expect(wrapper.prop('aria-label')).toEqual(expect.any(String));
  });

  test('hides the dot from assistive technology when a visible status label is present', () => {
    const wrapper = shallow(<StageStatusDot status={StageStatus.PASSED} isDecorative />);

    expect(wrapper.prop('aria-hidden')).toBe(true);
    expect(wrapper.prop('role')).toBeUndefined();
    expect(wrapper.prop('aria-label')).toBeUndefined();
  });
});

describe('StageStatusLabel', () => {
  test.each([
    [StageStatus.PENDING, 'Pending'],
    [StageStatus.RUNNING, 'Running'],
    [StageStatus.IN_PROGRESS, 'In progress'],
    [StageStatus.PASSED, 'Passed'],
    [StageStatus.DONE, 'Done'],
    [StageStatus.FAILED, 'Failed'],
    [StageStatus.SKIPPED, 'Skipped'],
  ])('renders %s as "%s"', (status, label) => {
    const wrapper = shallow(<StageStatusLabel status={status} />);

    expect(wrapper.text()).toBe(label);
  });
});
