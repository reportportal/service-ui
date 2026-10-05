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
import { IterationStatus } from 'types/aiFactory';
import { IterationStatusBadge } from './iterationStatusBadge';

jest.mock('@reportportal/ui-kit', () => ({
  ErrorIcon: 'ErrorIcon',
  RefreshIcon: 'RefreshIcon',
  StatusSuccessIcon: 'StatusSuccessIcon',
  WarningIcon: 'WarningIcon',
}));

// jest.requireActual's generic defaults to `any` — the standard Jest idiom for partial mocks.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));

describe('IterationStatusBadge', () => {
  test.each([
    [IterationStatus.RUNNING, 'Running'],
    [IterationStatus.IN_REVIEW, 'In review'],
    [IterationStatus.COMPLETED, 'Completed'],
    [IterationStatus.FAILED, 'Failed'],
  ])('renders "%s" as "%s"', (status, label) => {
    const wrapper = shallow(<IterationStatusBadge status={status} />);

    expect(wrapper.find('[data-automation-id="iterationStatusBadge"]').text()).toBe(label);
  });

  test('adds the status icon only when requested', () => {
    expect(shallow(<IterationStatusBadge status={IterationStatus.FAILED} />).find('ErrorIcon')).toHaveLength(0);
    expect(
      shallow(<IterationStatusBadge status={IterationStatus.FAILED} showIcon />).find('ErrorIcon'),
    ).toHaveLength(1);
  });
});
