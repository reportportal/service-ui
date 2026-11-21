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
import { mount } from 'enzyme';
import { fetch } from 'common/utils';
import { NOTIFICATION_TYPES } from 'controllers/notification';
import { useDeleteExecution } from './useDeleteExecution';
import type { DeleteExecutionModalData } from './types';

const mockDispatch = jest.fn();
const mockState = {
  project: { info: { projectKey: 'demo' } },
  location: { payload: { launchId: 7 }, query: {} },
};

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
  useStore: () => ({ getState: () => mockState }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

const mockedFetch = fetch as unknown as jest.Mock;

type DeleteExecutions = ReturnType<typeof useDeleteExecution>['deleteExecutions'];

const renderHook = () => {
  let deleteExecutions: DeleteExecutions | null = null;
  const capture = (result: ReturnType<typeof useDeleteExecution>) => {
    deleteExecutions = result.deleteExecutions;
  };
  const Harness = () => {
    capture(useDeleteExecution());
    return null;
  };
  mount(createElement(Harness));
  return (payload: DeleteExecutionModalData) => deleteExecutions?.(payload);
};

const notificationTypes = () =>
  mockDispatch.mock.calls.map(
    ([action]: [{ type: string; payload?: { type?: string } }]) => action.payload?.type,
  );

describe('useDeleteExecution', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockedFetch.mockReset();
  });

  test('a partially failed batch delete shows a warning and keeps the failed executions selected', async () => {
    mockedFetch.mockResolvedValue({
      totalCount: 2,
      successCount: 1,
      failureCount: 1,
      successExecutionIds: [11],
      errors: [{ executionId: 12, errorMessage: 'Execution not found' }],
    });
    const onClearSelection = jest.fn();
    const onKeepSelection = jest.fn();
    const deleteExecutions = renderHook();

    await act(async () => {
      await deleteExecutions({
        type: 'batch',
        launchId: 7,
        executionIds: [11, 12],
        onClearSelection,
        onKeepSelection,
      });
    });

    expect(onClearSelection).not.toHaveBeenCalled();
    expect(onKeepSelection).toHaveBeenCalledWith([12]);
    expect(notificationTypes()).toContain(NOTIFICATION_TYPES.WARNING);
    expect(notificationTypes()).not.toContain(NOTIFICATION_TYPES.SUCCESS);
  });

  test('a rejected batch delete shows the backend message', async () => {
    mockedFetch.mockRejectedValue({ errorCode: 40016, message: 'Too many executions' });
    const deleteExecutions = renderHook();

    await act(async () => {
      await deleteExecutions({ type: 'batch', launchId: 7, executionIds: [11] });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: 'Too many executions',
          type: NOTIFICATION_TYPES.ERROR,
        }) as unknown,
      }),
    );
  });
});
