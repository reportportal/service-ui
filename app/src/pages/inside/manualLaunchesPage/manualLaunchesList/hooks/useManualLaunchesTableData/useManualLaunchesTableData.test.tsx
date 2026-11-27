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

import { act, createElement, Fragment, type MouseEvent, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { MANUAL_LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';

import { useManualLaunchesTableData } from './useManualLaunchesTableData';
import { ManualTestCase } from '../../../types';

interface MockLinkProps {
  to: unknown;
  onClick?: (event: MouseEvent) => void;
  children?: ReactNode;
  className?: string;
}

const mockTrackEvent = jest.fn();
const mockFragment = (children: ReactNode) => createElement(Fragment, null, children);
const mockDispatch = jest.fn();
const mockLink = jest.fn(({ to, onClick, children, className }: MockLinkProps) =>
  createElement(
    'a',
    { 'data-to': JSON.stringify(to), href: '#launch', onClick, className },
    children,
  ),
);

jest.mock('redux-first-router-link', () => ({
  __esModule: true,
  default: (props: MockLinkProps) => mockLink(props),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: mockTrackEvent }),
}));

jest.mock('react-intl', () => ({
  ...jest.requireActual<object>('react-intl'),
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

jest.mock('hooks/useTypedSelector', () => ({
  useProjectDetails: () => ({ organizationSlug: 'org', projectSlug: 'project' }),
}));

jest.mock('controllers/pages', () => ({
  MANUAL_LAUNCH_DETAILS_PAGE: 'MANUAL_LAUNCH_DETAILS_PAGE',
}));

jest.mock('@reportportal/ui-kit', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => mockFragment(children),
}));

jest.mock('components/main/absRelTime', () => ({ AbsRelTime: () => null }));

jest.mock('components/statusBar', () => ({
  SegmentStatus: {},
  SegmentedStatusBar: () => null,
}));

jest.mock('../../testRunButton/testRunButton', () => ({ TestRunButton: () => null }));

const LAUNCH: ManualTestCase = {
  id: 42,
  displayId: 'ML42',
  count: 1,
  name: 'Regression launch',
  startTime: 0,
  totalTests: 3,
  successTests: 1,
  failedTests: 1,
  inProgressTests: 0,
  skippedTests: 0,
  testsToRun: 1,
};

const setSelectedLaunchId = jest.fn();
const onRowClick = jest.fn();

const TableCells = () => {
  const [row] = useManualLaunchesTableData([LAUNCH], null, setSelectedLaunchId);
  const { name, count } = row as unknown as Record<'name' | 'count', { component: ReactNode }>;

  return createElement(
    Fragment,
    null,
    createElement('div', { id: 'count' }, count.component),
    createElement('div', { id: 'name', onClick: onRowClick }, name.component),
  );
};

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

const renderCells = () => {
  act(() => {
    root.render(createElement(TableCells));
  });
};

const click = (element: Element | null) => {
  act(() => {
    element?.dispatchEvent(new window.MouseEvent('click', { bubbles: true, button: 0 }));
  });
};

describe('useManualLaunchesTableData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  test('renders the whole name cell as a link to the launch page', () => {
    renderCells();
    const nameCell = container.querySelector('#name');
    const link = nameCell?.querySelector('a');

    expect(nameCell?.firstElementChild).toBe(link);
    expect(JSON.parse(link?.getAttribute('data-to') ?? '')).toEqual({
      type: 'MANUAL_LAUNCH_DETAILS_PAGE',
      payload: { organizationSlug: 'org', projectSlug: 'project', launchId: '42' },
    });
    expect(link?.textContent).toBe('Regression launch');
    expect(link?.querySelector('[title="Regression launch"]')).not.toBeNull();
    expect(nameCell?.querySelector('button')).toBeNull();
  });

  test('tracks the click on the name cell and does not open the side panel', () => {
    renderCells();

    click(container.querySelector('#name a'));

    expect(onRowClick).not.toHaveBeenCalled();
    expect(mockTrackEvent).toHaveBeenCalledWith(
      MANUAL_LAUNCHES_PAGE_EVENTS.CLICK_OPEN_LAUNCH_DETAILS,
    );
    expect(setSelectedLaunchId).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test('keeps opening the side panel from other cells', () => {
    renderCells();

    click(container.querySelector('#count [role="button"]'));

    expect(setSelectedLaunchId).toHaveBeenCalledWith(42);
    expect(mockTrackEvent).toHaveBeenCalledWith(
      MANUAL_LAUNCHES_PAGE_EVENTS.CLICK_OPEN_LAUNCH_SIDEBAR,
    );
  });
});
