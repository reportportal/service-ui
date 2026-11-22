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

import { act, createElement, useEffect, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { takeLatest } from 'redux-saga/effects';

import { GET_TEST_PLAN, getTestPlanAction } from 'controllers/testPlan';
import { getTestPlan } from 'controllers/testPlan/sagas';
import { testPlanReducer } from 'controllers/testPlan/reducer';
import { PROJECT_TEST_PLAN_DETAILS_PAGE } from 'controllers/pages';

import { TestPlanDetailsPage } from './testPlanDetailsPage';

const mockCreateElement = createElement;
const mockUseEffect = useEffect;
const mockFetch = jest.fn();
const mockPanelMounts = jest.fn();
const mockPanelUnmounts = jest.fn();

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: (...args: unknown[]) => mockFetch(...args) as unknown,
}));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('hooks/useUserPermissions', () => ({
  useUserPermissions: () => ({ canManageTestCases: true, canCreateManualLaunch: true }),
}));
jest.mock('layouts/settingsLayout', () => ({
  SettingsLayout: ({ children }: { children: unknown }) => children,
}));
jest.mock('components/main/scrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: unknown }) => children,
}));
jest.mock('components/fields/searchField', () => ({ SearchField: () => null }));
jest.mock('../../common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: ({
    title,
    actions,
  }: {
    title: string;
    actions: ReactNode;
  }) =>
    mockCreateElement(
      'div',
      null,
      mockCreateElement('h1', { 'data-test': 'plan-title' }, title),
      actions,
    ),
}));
jest.mock('../testPlanActions', () => ({ TestPlanActions: () => null }));
jest.mock('./testPlanFolders', () => ({ TestPlanFolders: () => null }));
jest.mock('../pageLoader', () => ({
  PageLoader: () => mockCreateElement('div', { 'data-test': 'page-loader' }),
}));
jest.mock('../testPlanModals', () => ({
  useEditTestPlanModal: () => ({ openModal: jest.fn() }),
  useDuplicateTestPlanModal: () => ({ openModal: jest.fn() }),
  useDeleteTestPlanModal: () => ({ openModal: jest.fn() }),
  useCreateLaunchModal: () => ({ openModal: jest.fn() }),
  useAddTestCasesToCurrentTestPlan: () => ({
    addTestCasesToCurrentTestPlan: jest.fn(),
    isAddingTestCases: false,
  }),
}));
jest.mock('../../common/testLibrarySidePanel', () => ({
  TestLibrarySidePanel: () => {
    mockUseEffect(() => {
      mockPanelMounts();

      return () => {
        mockPanelUnmounts();
      };
    }, []);

    return mockCreateElement('div', { 'data-test': 'library-panel' });
  },
}));
jest.mock('controllers/testCase', () => ({
  areFoldersFetchedSelector: () => true,
  areFoldersLoadingSelector: () => false,
  getFoldersAction: () => ({ type: 'GET_FOLDERS' }),
  isLoadingFilteredFoldersSelector: () => false,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const flush = () => act(async () => Promise.resolve());

const planRs = { id: 5, name: 'Release plan', displayId: 'TP-5', executionStatistic: { total: 4 } };
const foldersRs = { content: [{ id: 1, name: 'Folder' }] };

describe('TestPlanDetailsPage plan loading', () => {
  let container: HTMLDivElement;
  let root: Root;

  const mount = () => {
    const sagaMiddleware = createSagaMiddleware();
    const location = {
      type: PROJECT_TEST_PLAN_DETAILS_PAGE,
      payload: { organizationSlug: 'org', projectSlug: 'proj', testPlanId: '5' },
      // the plan was opened from another page: the previous route has no plan id
      prev: { payload: {} },
    };
    const store = createStore(
      combineReducers({
        testPlan: testPlanReducer,
        location: (state: unknown = location) => state,
        project: (state: unknown = { info: { projectKey: 'proj' } }) => state,
      }),
      applyMiddleware(sagaMiddleware),
    );

    sagaMiddleware.run(function* watch() {
      yield takeLatest(GET_TEST_PLAN, getTestPlan);
    });

    act(() => {
      root.render(
        createElement(
          IntlProvider,
          { locale: 'en' },
          createElement(Provider, { store, children: createElement(TestPlanDetailsPage) }), // eslint-disable-line react/no-children-prop
        ),
      );
    });

    return store;
  };

  const query = (selector: string) => container.querySelector(selector);
  const loadPlan = async (store: ReturnType<typeof mount>, forceReloadPlan = false) => {
    act(() => {
      store.dispatch(getTestPlanAction({ testPlanId: 5, forceReloadPlan }));
    });
    await flush();
  };

  beforeEach(() => {
    mockFetch.mockReset();
    mockPanelMounts.mockReset();
    mockPanelUnmounts.mockReset();
    container = document.createElement('div');
    root = createRoot(container);
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test('keeps the library side panel mounted and the page content while the plan is reloaded', async () => {
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(String(url).includes('/tms/folder') ? foldersRs : planRs),
    );
    const store = mount();

    await loadPlan(store);
    act(() => {
      (query('[data-automation-id="addTestsFromLibraryButton"]') as HTMLElement).click();
    });
    expect(query('[data-test="library-panel"]')).not.toBeNull();

    await loadPlan(store, true);

    expect(query('[data-test="page-loader"]')).toBeNull();
    expect(query('[data-test="library-panel"]')).not.toBeNull();
    expect(mockPanelMounts).toHaveBeenCalledTimes(1);
    expect(mockPanelUnmounts).not.toHaveBeenCalled();
  });

  test('keeps the shown plan and the panel when a forced reload fails', async () => {
    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(String(url).includes('/tms/folder') ? foldersRs : planRs),
    );
    const store = mount();

    await loadPlan(store);
    act(() => {
      (query('[data-automation-id="addTestsFromLibraryButton"]') as HTMLElement).click();
    });
    mockFetch.mockRejectedValue({ errorCode: 5000, message: 'boom' });

    await loadPlan(store, true);

    expect(query('[data-test="plan-title"]')?.textContent).toBe('Release plan');
    expect(query('[data-automation-id="retryLoadTestPlanButton"]')).toBeNull();
    expect(query('[data-test="library-panel"]')).not.toBeNull();
    expect(mockPanelUnmounts).not.toHaveBeenCalled();
  });

  test('shows an error state with a retry when the first load fails, not the empty plan', async () => {
    mockFetch.mockRejectedValue({ errorCode: 5000, message: 'boom' });
    const store = mount();

    await loadPlan(store);

    expect(query('[data-automation-id="retryLoadTestPlanButton"]')).not.toBeNull();
    expect(query('[data-automation-id="addTestsFromLibraryButton"]')).toBeNull();

    mockFetch.mockImplementation((url: string) =>
      Promise.resolve(String(url).includes('/tms/folder') ? foldersRs : planRs),
    );
    act(() => {
      (query('[data-automation-id="retryLoadTestPlanButton"]') as HTMLElement).click();
    });
    await flush();

    expect(query('[data-test="plan-title"]')?.textContent).toBe('Release plan');
    expect(query('[data-automation-id="retryLoadTestPlanButton"]')).toBeNull();
  });
});
