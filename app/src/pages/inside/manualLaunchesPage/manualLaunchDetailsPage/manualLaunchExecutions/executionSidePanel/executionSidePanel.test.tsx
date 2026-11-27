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

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';

import { MANUAL_LAUNCH_EXECUTION_PAGE } from 'controllers/pages/constants';
import { ExecutionStatus } from 'pages/inside/manualLaunchesPage/types';

import { ExecutionSidePanel } from './executionSidePanel';

const mockDispatch = jest.fn();
const mockPermissions = { canManageExecutions: true };
const mockExecutionDetails: Record<string, unknown> = {
  id: 11,
  testCaseId: 22,
  testCaseName: 'Login',
  executionStatus: ExecutionStatus.TO_RUN,
};

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => [],
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('redux-first-router-link', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));

jest.mock('@reportportal/ui-kit', () => ({
  SidePanel: ({
    contentComponent,
    footerComponent,
  }: {
    contentComponent: ReactNode;
    footerComponent: ReactNode;
  }) => (
    <>
      <div data-testid="content">{contentComponent}</div>
      <div data-testid="footer">{footerComponent}</div>
    </>
  ),
  Button: ({
    children,
    onClick,
    'data-automation-id': automationId,
  }: {
    children: ReactNode;
    onClick?: () => void;
    'data-automation-id'?: string;
  }) => (
    <button type="button" onClick={onClick} data-automation-id={automationId}>
      {children}
    </button>
  ),
  AdaptiveTagList: () => null,
  BubblesLoader: () => null,
  ChevronDownDropdownIcon: () => null,
  DurationIcon: () => null,
  IssueList: () => null,
  RerunIcon: () => null,
  RunManualIcon: () => null,
}));

jest.mock('common/hooks', () => ({ useOnClickOutside: jest.fn() }));

jest.mock('controllers/manualLaunch', () => ({
  manualLaunchFoldersSelector: jest.fn(),
  manualLaunchTestCaseExecutionsSelector: jest.fn(),
  updateManualLaunchExecutionStatusAction: jest.fn((payload: unknown) => ({
    type: 'UPDATE_STATUS',
    payload,
  })),
}));

jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));

jest.mock('hooks/useTypedSelector', () => ({
  useManualLaunchId: () => 33,
  useProjectDetails: () => ({ organizationSlug: 'org', projectSlug: 'project' }),
}));

jest.mock('hooks/useUserPermissions', () => ({
  useUserPermissions: () => mockPermissions,
}));

jest.mock('./useExecutionDetails', () => ({
  useExecutionDetails: () => ({ executionDetails: mockExecutionDetails, isLoading: false }),
}));

jest.mock('pages/inside/manualLaunchesPage/executionStatusPopover', () => ({
  ExecutionStatusPopover: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock('components/collapsibleSection', () => ({ CollapsibleSection: () => null }));
jest.mock('components/fields/expandedTextSection', () => ({ ExpandedTextSection: () => null }));
jest.mock('components/folderBreadcrumbs', () => ({ FolderBreadcrumbs: () => null }));
jest.mock('pages/inside/common/infoBlock', () => ({ InfoBlock: () => null }));
jest.mock('pages/inside/common/priorityIcon', () => ({ PriorityIcon: () => null }));
jest.mock('pages/inside/common/requirementsList/requirementsList', () => ({
  RequirementsList: () => null,
}));
jest.mock('pages/inside/common/testCaseList/testCaseSidePanel/scenario', () => ({
  Scenario: () => null,
}));
jest.mock('pages/inside/common/attachmentsWithSlider', () => ({
  AttachmentsWithSlider: () => null,
}));
jest.mock('pages/inside/projectSettingsPageContainer/content/elements', () => ({
  Divider: () => null,
}));

describe('ExecutionSidePanel footer', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderPanel = () => {
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <ExecutionSidePanel executionId={11} onClose={jest.fn()} />
        </IntlProvider>,
      );
    });
  };

  const getButtonLabels = () =>
    Array.from(container.querySelectorAll('button')).map((button) => button.textContent);

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    mockDispatch.mockClear();
    mockPermissions.canManageExecutions = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  test('should show Open Details first, then Change Status and Run Test for an Editor', () => {
    renderPanel();

    expect(getButtonLabels()).toEqual(['Open Details', 'Change Status', 'Run Test']);
  });

  test('should show only Open Details for a Viewer', () => {
    mockPermissions.canManageExecutions = false;
    renderPanel();

    expect(getButtonLabels()).toEqual(['Open Details']);
  });

  test('should open the execution page without changing the status', () => {
    renderPanel();

    const openDetailsButton = container.querySelector<HTMLButtonElement>(
      '[data-automation-id="execution-open-details"]',
    );

    act(() => openDetailsButton.click());

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: MANUAL_LAUNCH_EXECUTION_PAGE,
      payload: {
        organizationSlug: 'org',
        projectSlug: 'project',
        launchId: 33,
        testCaseId: 22,
        executionId: 11,
      },
    });
  });
});

describe('ExecutionSidePanel execution comment block', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderPanel = () => {
    act(() => {
      root.render(
        <IntlProvider locale="en">
          <ExecutionSidePanel executionId={11} onClose={jest.fn()} />
        </IntlProvider>,
      );
    });
  };

  const hasExecutionInfo = () => !!container.querySelector('.execution-info');

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete mockExecutionDetails.executionComment;
    delete mockExecutionDetails.btsTickets;
  });

  test('should not show the block without a comment, execution attachments and BTS tickets', () => {
    mockExecutionDetails.executionComment = { comment: '', attachments: [] };
    renderPanel();

    expect(hasExecutionInfo()).toBe(false);
  });

  test('should show the block for a comment', () => {
    mockExecutionDetails.executionComment = { comment: 'Order button is missing', attachments: [] };
    renderPanel();

    expect(hasExecutionInfo()).toBe(true);
  });

  test('should show the block for execution attachments without a comment', () => {
    mockExecutionDetails.executionComment = { comment: '', attachments: [{ id: 1 }] };
    renderPanel();

    expect(hasExecutionInfo()).toBe(true);
  });
});
