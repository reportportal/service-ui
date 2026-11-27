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

import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IntlProvider } from 'react-intl';

import { MANUAL_LAUNCHES_PLACE } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';

import { ExecutionStatusPopover } from './executionStatusPopover';

const mockOpenModal = jest.fn();

jest.mock('react-redux', () => ({
  useSelector: () => [],
}));

jest.mock('controllers/manualLaunch', () => ({
  manualLaunchTestCaseExecutionsSelector: jest.fn(),
}));

jest.mock('pages/inside/projectSettingsPageContainer/content/elements', () => ({
  Divider: () => <hr />,
}));

jest.mock('../manualLaunchExecutionPage/executionStatusConfirmModal', () => ({
  useExecutionStatusModal: () => ({ openModal: mockOpenModal }),
}));

jest.mock('@reportportal/ui-kit', () => ({
  Popover: ({ content, children }: { content: ReactNode; children: ReactNode }) => (
    <div>
      {content}
      {children}
    </div>
  ),
}));

const container = document.createElement('div');

const renderPopover = (currentStatus: ExecutionStatus) => {
  container.innerHTML = renderToStaticMarkup(
    <IntlProvider locale="en">
      <ExecutionStatusPopover
        executionId={1}
        currentStatus={currentStatus}
        isOpened
        setIsOpened={jest.fn()}
        place={MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR}
      >
        <button type="button">Change Status</button>
      </ExecutionStatusPopover>
    </IntlProvider>,
  );

  return Array.from(container.querySelectorAll('button.status-option'));
};

describe('ExecutionStatusPopover', () => {
  test('should show every option with a coloured dot when the status is To Run', () => {
    const options = renderPopover(ExecutionStatus.TO_RUN);

    expect(options.map((option) => option.textContent)).toEqual([
      'Mark as Passed',
      'Mark as Failed',
      'Mark as Skipped',
    ]);
    expect(options.map((option) => option.querySelector('.dot')?.className)).toEqual([
      'dot dot--passed',
      'dot dot--failed',
      'dot dot--skipped',
    ]);
  });

  test('should hide the current status and keep Clear status without a dot', () => {
    const options = renderPopover(ExecutionStatus.FAILED);

    expect(options.map((option) => option.textContent)).toEqual([
      'Mark as Passed',
      'Mark as Skipped',
      'Clear status',
    ]);
    expect(options[options.length - 1].querySelector('.dot')).toBeNull();
  });
});
