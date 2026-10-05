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
import { EvaluationState } from 'types/aiFactory';
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
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values?: Record<string, string>,
    ) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, value),
        message.defaultMessage ?? message.id ?? '',
      ),
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
jest.mock('pages/inside/aiFactory/library', () => ({ AiQualityCell: 'AiQualityCell' }));
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

const ai = {
  generatedByIteration: { pipelineId: 17, iterationId: 103, number: 4 },
  modifiedByAgent: false,
  factoryKey: 'spec::case',
};
const review = { unsentCommentsCount: 2 };
const aiTestCase = {
  ...testCase,
  ai,
  evaluationSummary: { totalScore: 82, state: EvaluationState.EVALUATED },
  costSummary: { approxTotal: 0.42 },
  review,
};
const manualTestCase = {
  ...testCase,
  id: 43,
  displayId: 'TC43',
  name: 'Manual case',
  lifecycle: Lifecycle.DRAFT,
};

const renderList = (
  isEnabled: boolean,
  routeType: string,
  testCases: ExtendedTestCase[] = [testCase],
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useSelector).mockReturnValue({ type: routeType, query: {} });
  jest.mocked(useUserPermissions).mockReturnValue({
    canManageTestCases: true,
  } as ReturnType<typeof useUserPermissions>);

  return shallow(
    <TestCaseList
      testCases={testCases}
      folderTitle="All cases"
      selectedRowIds={[]}
      selectedRows={[]}
      instanceKey={TMS_INSTANCE_KEY.TEST_CASE}
      handleSelectedRows={jest.fn()}
    />,
  );
};

const getTableProps = (
  isEnabled: boolean,
  routeType: string,
  testCases: ExtendedTestCase[] = [testCase],
) => {
  const wrapper = renderList(isEnabled, routeType, testCases);
  return wrapper.find(Table).props() as {
    fixedColumns: { key: string }[];
    data: {
      name: { component: React.ReactElement };
      status?: { content: string };
      aiQuality?: { content: number | string; component: React.ReactElement };
    }[];
  };
};

const getNameCellProps = (nameComponent: React.ReactElement) =>
  shallow(nameComponent).find('DraggableTestCaseNameCell').props();

describe('TestCaseList lifecycle column', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    { description: 'the feature is disabled', isEnabled: false, route: TEST_CASE_LIBRARY_PAGE },
    { description: 'the current route is a test plan', isEnabled: true, route: PROJECT_TEST_PLAN_DETAILS_PAGE },
  ])('omits Status when $description', ({ isEnabled, route }) => {
    const table = getTableProps(isEnabled, route, [aiTestCase]);

    expect(table.fixedColumns.map(({ key }) => key)).not.toContain('status');
    expect(table.fixedColumns.map(({ key }) => key)).not.toContain('aiQuality');
    expect(table.data[0].status).toBeUndefined();
    expect(table.data[0].aiQuality).toBeUndefined();
    expect(getNameCellProps(table.data[0].name.component)).toMatchObject({
      ai: undefined,
      review: undefined,
    });
  });

  test('orders Status and AI quality before Last execution for Library C1 data', () => {
    const table = getTableProps(true, TEST_CASE_LIBRARY_PAGE, [aiTestCase]);

    expect(table.fixedColumns.map(({ key }) => key)).toEqual([
      'status',
      'aiQuality',
      'lastExecution',
    ]);
    expect(table.data[0].status?.content).toBe(Lifecycle.READY);
    expect(table.data[0].aiQuality?.content).toBe(82);
  });

  test('passes guarded AI data only to its AI-generated row in a mixed Library list', () => {
    const table = getTableProps(true, TEST_CASE_LIBRARY_PAGE, [aiTestCase, manualTestCase]);
    const aiNameProps = getNameCellProps(table.data[0].name.component);
    const manualNameProps = getNameCellProps(table.data[1].name.component);
    const aiQualityProps = shallow(table.data[0].aiQuality?.component).find('AiQualityCell').props();
    const manualQualityProps = shallow(table.data[1].aiQuality?.component)
      .find('AiQualityCell')
      .props();

    expect(aiNameProps).toMatchObject({ ai, review });
    expect(manualNameProps).toMatchObject({ ai: undefined, review: undefined });
    expect(aiQualityProps).toMatchObject({
      ai,
      evaluationSummary: aiTestCase.evaluationSummary,
      costSummary: aiTestCase.costSummary,
    });
    expect(manualQualityProps).toMatchObject({
      ai: undefined,
      evaluationSummary: undefined,
      costSummary: undefined,
    });
  });

  test('keeps the accessible row opener separate from AI and drag controls', () => {
    const table = getTableProps(true, TEST_CASE_LIBRARY_PAGE, [aiTestCase]);
    const nameCell = shallow(table.data[0].name.component);
    const openButton = nameCell.find('button');

    expect(openButton).toHaveLength(1);
    expect(openButton.prop('type')).toBe('button');
    expect(openButton.prop('title')).toBe('TC42 Lifecycle case');
    expect(openButton.prop('aria-label')).toBe('Open test case TC42: Lifecycle case');
    expect(openButton.prop('role')).toBeUndefined();
    expect(openButton.prop('tabIndex')).toBeUndefined();
    expect(typeof openButton.prop('onClick')).toBe('function');
    expect(openButton.find('DraggableTestCaseNameCell')).toHaveLength(0);
    expect(nameCell.find('DraggableTestCaseNameCell')).toHaveLength(1);
  });
});
