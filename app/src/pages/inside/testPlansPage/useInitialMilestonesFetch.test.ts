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

import { useInitialMilestonesFetch } from './useInitialMilestonesFetch';

const mockDispatch = jest.fn();
let mockState: { milestones: unknown; loading: boolean; authorized: boolean };

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector(mockState),
}));

jest.mock('controllers/milestone', () => ({
  getMilestonesAction: (payload: unknown) => ({ type: 'getMilestones', payload }),
  milestonesSelector: (state: { milestones: unknown }) => state.milestones,
  milestonesLoadingSelector: (state: { loading: boolean }) => state.loading,
}));

jest.mock('controllers/auth', () => ({
  isAuthorizedSelector: (state: { authorized: boolean }) => state.authorized,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const queryParams = { offset: 0, limit: 20 };

const Probe = () => {
  useInitialMilestonesFetch(queryParams);
  return null;
};

const render = (root: Root) =>
  act(() => {
    root.render(createElement(Probe));
  });

describe('useInitialMilestonesFetch', () => {
  let root: Root;

  beforeEach(() => {
    mockDispatch.mockClear();
    root = createRoot(document.createElement('div'));
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  test('does not refetch in a loop when the route fetch fails', () => {
    mockState = { milestones: undefined, loading: true, authorized: true };
    render(root);

    // the route thunk request fails: data stays empty and loading ends
    mockState = { milestones: undefined, loading: false, authorized: true };
    render(root);
    render(root);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('fetches once when the page opens without data', () => {
    mockState = { milestones: undefined, loading: false, authorized: true };
    render(root);

    // the request fails as well
    render(root);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'getMilestones', payload: queryParams });
  });
});
