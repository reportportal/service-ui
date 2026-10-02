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

import { Children, type ReactElement, type ReactNode } from 'react';
import { shallow } from 'enzyme';
import { Button } from '@reportportal/ui-kit';

import { CollapsibleSection } from 'components/collapsibleSection';
import {
  Lifecycle,
  LifecycleActorType,
  LifecycleReason,
  type LifecycleHistoryEntryRS,
} from 'types/aiFactory';

import { LifecycleHistory } from './lifecycleHistory';
import { useTestCaseAi } from './useTestCaseAi';

jest.mock('@reportportal/ui-kit', () => ({
  BubblesLoader: 'BubblesLoader',
  Button: 'Button',
  ChevronDownDropdownIcon: 'ChevronDownDropdownIcon',
}));
// jest.requireActual's generic defaults to `any` — the standard Jest idiom for partial mocks.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage: string },
      values: Record<string, string | number> = {},
    ) =>
      Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('./useTestCaseAi', () => ({ useTestCaseAi: jest.fn() }));

const reload = jest.fn();
const baseHookResult = {
  data: null,
  isLoading: false,
  isError: false,
  reload,
};

const history: LifecycleHistoryEntryRS[] = [
  {
    to: Lifecycle.DRAFT,
    reason: LifecycleReason.CREATED,
    actor: { type: LifecycleActorType.USER, name: 'Alice' },
    at: 1,
  },
  {
    from: Lifecycle.READY,
    to: Lifecycle.DRAFT,
    reason: LifecycleReason.SCENARIO_CHANGED,
    details: 'Scenario edited',
    actor: { type: LifecycleActorType.USER, name: 'Bob' },
    at: 2,
  },
];

describe('LifecycleHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTestCaseAi).mockReturnValue(baseHookResult);
  });

  test('passes request identity and enabled state to the data hook', () => {
    shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled={false} />);

    expect(useTestCaseAi).toHaveBeenCalledWith('demo', 42, false);
  });

  test('renders the collapsed empty state when there is no lifecycle history', () => {
    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);

    expect(wrapper.find(CollapsibleSection).props()).toMatchObject({
      title: 'History',
      defaultMessage: 'No lifecycle changes yet',
      isInitiallyExpanded: false,
    });
    expect(wrapper.find('ul')).toHaveLength(0);
  });

  test('renders lifecycle history newest first and expands the section', () => {
    jest.mocked(useTestCaseAi).mockReturnValue({
      ...baseHookResult,
      data: { pipelineLinks: [], lifecycleHistory: history },
    });
    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);
    const list = wrapper.find(CollapsibleSection).prop('children') as ReactElement<{
      children: ReactNode;
    }>;
    const entries = Children.toArray(list.props.children) as ReactElement<{
      entry: LifecycleHistoryEntryRS;
    }>[];

    expect(wrapper.find(CollapsibleSection).prop('isInitiallyExpanded')).toBe(true);
    expect(entries.map(({ props }) => props.entry.reason)).toEqual([
      LifecycleReason.SCENARIO_CHANGED,
      LifecycleReason.CREATED,
    ]);

    const newestEntry = shallow(entries[0]);
    expect(newestEntry.text()).toContain('Scenario changed · Scenario edited');
    expect(newestEntry.text()).toContain('by Bob');
  });

  test('drops invalid transitions and falls back for unknown optional fields', () => {
    jest.mocked(useTestCaseAi).mockReturnValue({
      ...baseHookResult,
      data: {
        pipelineLinks: [],
        lifecycleHistory: [
          null,
          { to: 'UNKNOWN' },
          { to: Lifecycle.READY, reason: 'FUTURE_REASON', actor: null, at: 'invalid' },
        ],
      } as unknown as NonNullable<ReturnType<typeof useTestCaseAi>['data']>,
    });

    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);
    const list = wrapper.find(CollapsibleSection).prop('children') as ReactElement<{
      children: ReactNode;
    }>;
    const entries = Children.toArray(list.props.children) as ReactElement[];

    expect(entries).toHaveLength(1);
    const validEntry = shallow(entries[0]);
    expect(validEntry.text()).toContain('Lifecycle changed');
    expect(validEntry.text()).toContain('by Unknown actor');
    expect(validEntry.find('AbsRelTime')).toHaveLength(0);
  });

  test('does not render time for a finite timestamp outside the JavaScript Date range', () => {
    jest.mocked(useTestCaseAi).mockReturnValue({
      ...baseHookResult,
      data: {
        pipelineLinks: [],
        lifecycleHistory: [
          {
            to: Lifecycle.DRAFT,
            reason: LifecycleReason.CREATED,
            actor: { type: LifecycleActorType.SYSTEM, name: 'System' },
            at: 1e308,
          },
        ],
      },
    });

    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);
    const list = wrapper.find(CollapsibleSection).prop('children') as ReactElement<{
      children: ReactNode;
    }>;
    const [entry] = Children.toArray(list.props.children) as ReactElement[];
    const renderedEntry = shallow(entry);

    expect(renderedEntry.text()).toContain('Created');
    expect(renderedEntry.find('AbsRelTime')).toHaveLength(0);
  });

  test('renders an accessible loading state', () => {
    jest.mocked(useTestCaseAi).mockReturnValue({ ...baseHookResult, isLoading: true });
    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);

    expect(wrapper.find('[role="status"]').prop('aria-label')).toBe('Loading lifecycle history');
    expect(wrapper.find(CollapsibleSection).prop('isInitiallyExpanded')).toBe(true);
  });

  test('renders an error and retries the request', () => {
    jest.mocked(useTestCaseAi).mockReturnValue({ ...baseHookResult, isError: true });
    const wrapper = shallow(<LifecycleHistory projectKey="demo" testCaseId={42} isEnabled />);

    expect(wrapper.find('[role="alert"]').text()).toContain(
      'Lifecycle history could not be loaded',
    );
    const onRetry = wrapper.find(Button).prop('onClick') as () => void;
    onRetry();

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
