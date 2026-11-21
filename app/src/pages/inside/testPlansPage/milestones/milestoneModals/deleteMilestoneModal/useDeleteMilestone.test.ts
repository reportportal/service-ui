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
import { push } from 'redux-first-router';

import { GET_MILESTONES } from 'controllers/milestone';

import { useDeleteMilestone } from './useDeleteMilestone';

const mockDispatch = jest.fn();
const mockFetch = jest.fn();
let mockQueryParams = { offset: 0, limit: 20 };
let mockState: Record<string, unknown>;

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

jest.mock('redux-first-router', () => ({
  ...jest.requireActual<Record<string, unknown>>('redux-first-router'),
  push: jest.fn(),
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));

jest.mock('common/hooks', () => ({
  useDebouncedSpinner: () => ({ isLoading: false, showSpinner: jest.fn(), hideSpinner: jest.fn() }),
  useQueryParams: () => mockQueryParams,
}));

jest.mock('hooks/useTypedSelector', () => ({
  useProjectDetails: () => ({ organizationSlug: 'org', projectSlug: 'proj' }),
}));

jest.mock('hooks/useHasTestPlans', () => ({
  resetHasTestPlansCache: jest.fn(),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type HookResult = ReturnType<typeof useDeleteMilestone>;

const stateWithOneMilestone = (pageNumber: number) => ({
  project: { info: { projectKey: 'proj' } },
  milestone: {
    data: { content: [{ id: 1 }], page: { number: pageNumber, totalPages: pageNumber } },
  },
});

describe('useDeleteMilestone', () => {
  let root: Root;
  let hook: HookResult;

  const Probe = ({ onRender }: { onRender: (result: HookResult) => void }) => {
    onRender(useDeleteMilestone());
    return null;
  };

  const render = () =>
    act(() => {
      root.render(
        createElement(Probe, {
          onRender: (result) => {
            hook = result;
          },
        }),
      );
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({});
    root = createRoot(document.createElement('div'));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('refetches the list when the last milestone on the first page is deleted', async () => {
    mockQueryParams = { offset: 0, limit: 20 };
    mockState = stateWithOneMilestone(1);
    render();

    await hook.deleteMilestone(1);

    expect(push).not.toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: GET_MILESTONES, payload: mockQueryParams }),
    );
  });

  test('goes to the previous page when the last milestone on a later page is deleted', async () => {
    mockQueryParams = { offset: 20, limit: 20 };
    mockState = stateWithOneMilestone(2);
    render();

    await hook.deleteMilestone(1);

    expect(push).toHaveBeenCalledWith(
      '/organizations/org/projects/proj/milestones?offset=0&limit=20',
    );
  });
});
