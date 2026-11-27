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

import { renderToStaticMarkup } from 'react-dom/server';
import { IntlProvider } from 'react-intl';

import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';

import { ExecutionStatusBadge } from './executionStatusBadge';
import { hasExecutionStatusBadge } from './utils';

const container = document.createElement('div');

const renderBadge = (status: string) => {
  container.innerHTML = renderToStaticMarkup(
    <IntlProvider locale="en">
      <ExecutionStatusBadge status={status} />
    </IntlProvider>,
  );
};

describe('ExecutionStatusBadge', () => {
  test.each([
    [ExecutionStatus.PASSED, 'Passed', 'dot--passed'],
    [ExecutionStatus.FAILED, 'Failed', 'dot--failed'],
    [ExecutionStatus.SKIPPED, 'Skipped', 'dot--skipped'],
    ['passed', 'Passed', 'dot--passed'],
  ])('should render a coloured dot and label for %s', (status, label, dotClass) => {
    renderBadge(status);

    expect(container.querySelector('.label')?.textContent).toBe(label);
    expect(container.querySelector('.dot')?.classList.contains(dotClass)).toBe(true);
  });

  test.each([
    [ExecutionStatus.TO_RUN, 'To Run'],
    [ExecutionStatus.IN_PROGRESS, 'In progress'],
  ])('should render only a label for %s', (status, label) => {
    renderBadge(status);

    expect(container.querySelector('.label')?.textContent).toBe(label);
    expect(container.querySelector('.dot')).toBeNull();
  });

  test('should render nothing for a status without a badge', () => {
    renderBadge(ExecutionStatus.INTERRUPTED);

    expect(container.querySelector('.execution-status-badge')).toBeNull();
  });

  test('hasExecutionStatusBadge should report supported statuses', () => {
    expect(hasExecutionStatusBadge(ExecutionStatus.PASSED)).toBe(true);
    expect(hasExecutionStatusBadge(ExecutionStatus.TO_RUN)).toBe(true);
    expect(hasExecutionStatusBadge(ExecutionStatus.STOPPED)).toBe(false);
    expect(hasExecutionStatusBadge(undefined)).toBe(false);
  });
});
