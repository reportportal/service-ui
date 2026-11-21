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
import { updatePagePropertiesAction } from 'controllers/pages';
import {
  GET_MANUAL_LAUNCHES,
  getManualLaunchesAction,
  type GetManualLaunchesParams,
} from 'controllers/manualLaunch';
import { useDeleteManualLaunches } from './useDeleteManualLaunches';
import { DeleteManualLaunchModalData } from './types';

const mockDispatch = jest.fn();
let mockState: Record<string, unknown>;
const createState = (query: Record<string, string>, launchesOnPage: number) => ({
  project: { info: { projectKey: 'demo' } },
  location: { query },
  manualLaunch: {
    data: {
      content: Array.from({ length: launchesOnPage }, (_, index) => ({ id: index + 1 })),
      page: {},
    },
  },
});

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

type DeleteLaunches = ReturnType<typeof useDeleteManualLaunches>['deleteLaunches'];

const renderHook = (data: DeleteManualLaunchModalData) => {
  let deleteLaunches: DeleteLaunches | null = null;
  const capture = (result: ReturnType<typeof useDeleteManualLaunches>) => {
    deleteLaunches = result.deleteLaunches;
  };
  const Harness = () => {
    capture(useDeleteManualLaunches({ data }));
    return null;
  };
  mount(createElement(Harness));
  return (payload: DeleteManualLaunchModalData) => deleteLaunches?.(payload);
};

const dispatchedTypes = () =>
  mockDispatch.mock.calls.map(
    ([action]: [{ type: string; payload?: { type?: string } }]) => action.payload?.type,
  );

describe('useDeleteManualLaunches', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockedFetch.mockReset();
    mockState = createState({}, 3);
  });

  test('a partially failed batch delete shows a warning and keeps the failed launches selected', async () => {
    mockedFetch.mockResolvedValue({
      totalCount: 3,
      successCount: 2,
      failureCount: 1,
      successLaunchIds: [1, 3],
      errors: [{ launchId: 2, errorMessage: 'Launch is locked' }],
    });
    const onClearSelection = jest.fn();
    const onKeepSelection = jest.fn();
    const data: DeleteManualLaunchModalData = {
      type: 'batch',
      launchIds: [1, 2, 3],
      onClearSelection,
      onKeepSelection,
    };
    const deleteLaunches = renderHook(data);

    await act(async () => {
      await deleteLaunches(data);
    });

    expect(onClearSelection).not.toHaveBeenCalled();
    expect(onKeepSelection).toHaveBeenCalledWith([2]);
    expect(dispatchedTypes()).toContain(NOTIFICATION_TYPES.WARNING);
    expect(dispatchedTypes()).not.toContain(NOTIFICATION_TYPES.SUCCESS);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          messageId: 'batchPartialFailure',
          values: expect.objectContaining({ failureCount: 1, errors: 'Launch is locked' }),
        }) as unknown,
      }),
    );
  });

  test('a rejected delete shows the backend message', async () => {
    mockedFetch.mockRejectedValue({ errorCode: 4001, message: 'Launch not found' });
    const data: DeleteManualLaunchModalData = { type: 'single', id: 1, name: 'launch' };
    const deleteLaunches = renderHook(data);

    await act(async () => {
      await deleteLaunches(data);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          message: 'Launch not found',
          type: NOTIFICATION_TYPES.ERROR,
        }) as unknown,
      }),
    );
  });

  test('the list is reloaded with the active search and filters after a delete', async () => {
    mockState = createState(
      { searchQuery: 'smoke', filterStatuses: 'FAILED', offset: '20', limit: '20' },
      5,
    );
    mockedFetch.mockResolvedValue(undefined);
    const data: DeleteManualLaunchModalData = { type: 'single', id: 1, name: 'launch' };
    const deleteLaunches = renderHook(data);

    await act(async () => {
      await deleteLaunches(data);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      getManualLaunchesAction(
        expect.objectContaining({
          offset: '20',
          limit: '20',
          searchQuery: 'smoke',
          filterStatuses: ['FAILED'],
        }) as GetManualLaunchesParams,
      ),
    );
  });

  test('deleting the last launch of a page moves back to the previous page', async () => {
    mockState = createState({ offset: '40', limit: '20' }, 1);
    mockedFetch.mockResolvedValue(undefined);
    const data: DeleteManualLaunchModalData = { type: 'single', id: 1, name: 'launch' };
    const deleteLaunches = renderHook(data);

    await act(async () => {
      await deleteLaunches(data);
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      updatePagePropertiesAction({ offset: 20, limit: 20 }),
    );
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: GET_MANUAL_LAUNCHES }),
    );
  });
});
