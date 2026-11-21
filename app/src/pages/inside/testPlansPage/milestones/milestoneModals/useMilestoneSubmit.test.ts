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

import { useMilestoneSubmit } from './useMilestoneSubmit';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => 'project_key',
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({
    isLoading: false,
    showSpinner: jest.fn(),
    hideSpinner: jest.fn(),
  }),
  useQueryParams: () => ({ offset: 0, limit: 20 }),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookResult = ReturnType<typeof useMilestoneSubmit>;

const payload = {
  name: 'Release 1',
  type: 'RELEASE' as const,
  status: 'SCHEDULED' as const,
  startDate: '2026-03-10T00:00:00.000Z',
  endDate: '2026-03-24T00:00:00.000Z',
};

describe('useMilestoneSubmit', () => {
  let root: Root;
  let hook: HookResult;

  const Probe = ({ onRender }: { onRender: (result: HookResult) => void }) => {
    onRender(
      useMilestoneSubmit({
        url: '/milestone/1',
        method: 'patch',
        successMessageId: 'milestoneUpdatedSuccess',
      }),
    );
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    root = createRoot(document.createElement('div'));
    act(() => {
      root.render(
        createElement(Probe, {
          onRender: (result) => {
            hook = result;
          },
        }),
      );
    });
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('shows the backend error message', async () => {
    mockFetch.mockRejectedValueOnce({ errorCode: 4091, message: 'Milestone name already exists' });

    await hook.submit(payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'error',
          message: 'Milestone name already exists',
          messageId: '',
        }) as unknown,
      }),
    );
  });

  test('falls back to the generic message when the error has none', async () => {
    mockFetch.mockRejectedValueOnce(new Error(''));

    await hook.submit(payload);

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          type: 'error',
          messageId: 'errorOccurredTryAgain',
        }) as unknown,
      }),
    );
  });
});
