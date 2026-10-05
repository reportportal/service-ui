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
import { useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  locationSelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import {
  areFoldersLoadingSelector,
  foldersSelector,
  isLoadingFilteredFoldersSelector,
} from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';

import { MainPageEmptyState } from './emptyState/mainPage';
import { TestCaseFolders } from './testCaseFolders';
import { TestCaseLibraryPage } from './testCaseLibraryPage';

jest.mock('@reportportal/ui-kit', () => ({
  Breadcrumbs: 'Breadcrumbs',
  BubblesLoader: 'BubblesLoader',
  Button: 'Button',
  FilterFilledIcon: 'FilterFilledIcon',
  FilterOutlineIcon: 'FilterOutlineIcon',
}));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    FILTER_FIELD: { TAG: 'tag', PRIORITY: 'priority', PRIORITY_AND_TAG: 'priorityAndTag' },
    TEST_CASE_LIBRARY_EVENTS: {
      CLICK_IMPORT_TEST_CASES: {},
      CLICK_CREATE_TEST_CASE: {},
      CLICK_SEARCH_TEST_CASES: {},
      applyFilterTestCases: jest.fn(),
    },
  }),
  { virtual: true },
);
jest.mock('react-redux', () => ({ useDispatch: () => jest.fn(), useSelector: jest.fn() }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('html-react-parser', () => ({ __esModule: true, default: (value: string) => value }));
jest.mock('common/hooks', () => ({ useBreadCrumbsTree: () => ({}) }));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: unknown[]) =>
    classNames
      .flatMap((className) => {
        if (typeof className === 'string' && className) return [className];
        if (typeof className !== 'object' || className === null) return [];

        return Object.entries(className)
          .filter(([, isActive]) => isActive)
          .map(([name]) => name);
      })
      .join(' '),
  debounce: (callback: (...args: unknown[]) => unknown) => callback,
}));
jest.mock('components/fields/searchField', () => ({ SearchField: 'SearchField' }));
jest.mock('components/main/navLink', () => ({ NavLink: 'NavLink' }));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('components/preservedText', () => ({ PreservedText: 'PreservedText' }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_PAGE: 'PROJECT_DASHBOARD_PAGE',
  locationSelector: jest.fn(),
  updatePagePropertiesAction: (payload: unknown) => ({ type: 'updatePageProperties', payload }),
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectNameSelector: jest.fn() }));
jest.mock('controllers/testCase', () => ({
  areFoldersLoadingSelector: jest.fn(),
  foldersSelector: jest.fn(),
  isLoadingFilteredFoldersSelector: jest.fn(),
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
jest.mock('pages/inside/common/betaBadge', () => ({ BetaBadge: 'BetaBadge' }));
jest.mock('pages/inside/common/testCaseList/filterSidePanel', () => ({
  FilterSidePanel: 'FilterSidePanel',
}));
jest.mock('pages/inside/common/testCaseList/filterSidePanel/utils', () => ({
  parsePrioritiesFromQuery: () => [],
  parseTagsFromQuery: () => [],
  toBackendPriority: jest.fn(),
}));
jest.mock('./createTestCaseModal', () => ({
  useCreateTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('./emptyState/mainPage', () => ({ MainPageEmptyState: 'MainPageEmptyState' }));
jest.mock('./importTestCaseModal', () => ({
  useImportTestCaseModal: () => ({ openModal: jest.fn() }),
}));
jest.mock('./testCaseFolders', () => ({ TestCaseFolders: 'TestCaseFolders' }));

let query: Record<string, string> = {};

const renderPage = (isAiFactoryEnabled: boolean) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isAiFactoryEnabled);
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases: false,
  } as ReturnType<typeof useUserPermissions>);
  jest.mocked(useSelector).mockImplementation((selector) => {
    if (selector === projectNameSelector) return 'Demo project';
    if (selector === foldersSelector) return [];
    if (selector === areFoldersLoadingSelector) return false;
    if (selector === isLoadingFilteredFoldersSelector) return false;
    if (selector === locationSelector) return { query };
    if (selector === urlOrganizationAndProjectSelector) {
      return { organizationSlug: 'org', projectSlug: 'project' };
    }
    return undefined;
  });

  return shallow(<TestCaseLibraryPage />);
};

describe('TestCaseLibraryPage zero-folder AI deep links', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    query = { lifecycle: 'DRAFT', ai: 'AI', iteration: '103' };
  });

  test('mounts the Library results surface for a valid AI-only deep link when feature ON', () => {
    const wrapper = renderPage(true);

    expect(wrapper.find(TestCaseFolders)).toHaveLength(1);
    expect(wrapper.find(MainPageEmptyState)).toHaveLength(0);
    expect(wrapper.find('.test-case-library-page__content--no-padding')).toHaveLength(1);
  });

  test('keeps the standard empty state for the same AI-only deep link when feature OFF', () => {
    const wrapper = renderPage(false);

    expect(wrapper.find(TestCaseFolders)).toHaveLength(0);
    expect(wrapper.find(MainPageEmptyState)).toHaveLength(1);
    expect(wrapper.find('.test-case-library-page__content--no-padding')).toHaveLength(0);
  });

  test('does not treat malformed AI-only params as an active deep link', () => {
    query = { lifecycle: 'draft', ai: 'yes', iteration: '-1' };

    const wrapper = renderPage(true);

    expect(wrapper.find(TestCaseFolders)).toHaveLength(0);
    expect(wrapper.find(MainPageEmptyState)).toHaveLength(1);
    expect(wrapper.find('.test-case-library-page__content--no-padding')).toHaveLength(0);
  });
});
