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

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { MilestoneStatus, type TmsMilestoneRS } from 'controllers/milestone';

import { ChangeMilestoneStatusModal } from './changeMilestoneStatusModal';
import type { ChangeMilestoneStatusModalData } from './types';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ project: { info: { projectKey: 'proj' } }, form: {} }),
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({ isLoading: false, showSpinner: jest.fn(), hideSpinner: jest.fn() }),
  useQueryParams: () => ({ offset: 0, limit: 20 }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const milestoneFixture = (overrides: Partial<TmsMilestoneRS>): TmsMilestoneRS =>
  ({
    id: 7,
    name: 'Release 1.0',
    type: 'RELEASE',
    status: MilestoneStatus.SCHEDULED,
    startDate: null,
    endDate: null,
    testPlans: [],
    ...overrides,
  }) as TmsMilestoneRS;

const findButtonByText = (text: string): HTMLButtonElement | undefined =>
  Array.from(document.querySelectorAll('button')).find(
    (button) => button.textContent?.trim() === text,
  );

const nullDateCases = [
  {
    name: '"Start without a date" sends an explicit null startDate',
    buttonText: 'Start Without a Date',
    nullField: 'startDate',
    milestone: milestoneFixture({
      status: MilestoneStatus.SCHEDULED,
      startDate: null,
      endDate: '2026-12-31T00:00:00Z',
    }),
    targetStatus: MilestoneStatus.TESTING,
    expectedData: {
      name: 'Release 1.0',
      type: 'RELEASE',
      status: MilestoneStatus.TESTING,
      startDate: null,
      endDate: '2026-12-31T00:00:00Z',
    },
  },
  {
    name: '"Complete without deadline" sends an explicit null endDate',
    buttonText: 'Complete without Deadline',
    nullField: 'endDate',
    milestone: milestoneFixture({
      status: MilestoneStatus.TESTING,
      startDate: '2026-01-01T00:00:00Z',
      endDate: null,
    }),
    targetStatus: MilestoneStatus.COMPLETED,
    expectedData: {
      name: 'Release 1.0',
      type: 'RELEASE',
      status: MilestoneStatus.COMPLETED,
      startDate: '2026-01-01T00:00:00Z',
      endDate: null,
    },
  },
];

describe('ChangeMilestoneStatusModal request bodies', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderModal = (data: ChangeMilestoneStatusModalData) =>
    act(() => {
      root.render(
        createElement(
          IntlProvider,
          { locale: 'en', onError: () => undefined },
          createElement(ChangeMilestoneStatusModal, { data }),
        ),
      );
    });

  const clickButton = async (text: string) => {
    const button = findButtonByText(text);
    expect(button).toBeDefined();

    await act(async () => {
      button?.click();
      await flushPromises();
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({});
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test.each(nullDateCases)(
    '$name',
    async ({ buttonText, nullField, milestone, targetStatus, expectedData }) => {
      renderModal({ milestone, targetStatus });

      await clickButton(buttonText);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, params] = mockFetch.mock.calls[0] as [string, { method: string; data: unknown }];
      expect(params.method).toBe('patch');
      expect(params.data).toEqual(expectedData);
      expect(JSON.stringify(params.data)).toContain(`"${nullField}":null`);
    },
  );
});
