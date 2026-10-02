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
import { Table } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { PROJECT_TEST_PLAN_DETAILS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { Lifecycle } from 'types/aiFactory';
import type { ExtendedTestCase } from 'types/testCase';

import { TestCaseList } from './testCaseList';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'BubblesLoader',
  Table: 'Table',
}));
jest.mock('@reportportal/ui-kit/sortable', () => ({ DragLayer: 'DragLayer' }));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({ TEST_CASE_LIBRARY_EVENTS: { clickTestCaseRow: jest.fn() } }),
  { virtual: true },
);
jest.mock('react-dom', () => ({ createPortal: (node: unknown) => node }));
jest.mock('react-redux', () => ({ useSelector: jest.fn() }));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_TEST_PLAN_DETAILS_PAGE: 'PROJECT_TEST_PLAN_DETAILS_PAGE',
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
}));
jest.mock('controllers/pages/typed-selectors', () => ({ locationSelector: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/common', () => ({ EmptyPageState: 'EmptyPageState' }));
jest.mock('pages/inside/testPlansPage/testPlanSidePanel', () => ({
  TestPlanSidePanel: 'TestPlanSidePanel',
}));
jest.mock('./draggableTestCaseNameCell', () => ({
  DraggableTestCaseNameCell: 'DraggableTestCaseNameCell',
}));
jest.mock('./testCaseExecutionCell', () => ({
  TestCaseExecutionCell: 'TestCaseExecutionCell',
}));
jest.mock('./testCaseSidePanel', () => ({ TestCaseSidePanel: 'TestCaseSidePanel' }));

const testCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Lifecycle case',
  priority: 'NORMAL',
  updatedAt: 1,
  attributes: [],
  testFolder: { id: 7 },
  lifecycle: Lifecycle.READY,
} as unknown as ExtendedTestCase;

const renderList = (isEnabled: boolean, routeType: string) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useSelector).mockReturnValue({ type: routeType, query: {} });
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases: true,
  } as ReturnType<typeof useUserPermissions>);

  return shallow(
    <TestCaseList
      testCases={[testCase]}
      folderTitle="All cases"
      selectedRowIds={[]}
      selectedRows={[]}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      handleSelectedRows={jest.fn()}
    />,
  );
};

const getTableProps = (isEnabled: boolean, routeType: string) => {
  const wrapper = renderList(isEnabled, routeType);
  return wrapper.find(Table).props() as {
    fixedColumns: { key: string }[];
    data: { status?: { content: string } }[];
  };
};

describe('TestCaseList lifecycle column', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { description: 'the feature is disabled', isEnabled: false, route: TEST_CASE_LIBRARY_PAGE },
    { description: 'the current route is a test plan', isEnabled: true, route: PROJECT_TEST_PLAN_DETAILS_PAGE },
  ])('omits Status when $description', ({ isEnabled, route }) => {
    const table = getTableProps(isEnabled, route);

    expect(table.fixedColumns.map(({ key }) => key)).not.toContain('status');
    expect(table.data[0].status).toBeUndefined();
  });

  test('shows Status in the Library when the feature is enabled and lifecycle data exists', () => {
    const table = getTableProps(true, TEST_CASE_LIBRARY_PAGE);

    expect(table.fixedColumns.map(({ key }) => key)).toContain('status');
    expect(table.data[0].status?.content).toBe(Lifecycle.READY);
  });
});
