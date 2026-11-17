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

import { act, type ReactNode } from 'react';
import { Dropdown } from '@reportportal/ui-kit';
import { StageTraceAttemptSwitcher } from './stageTraceAttemptSwitcher';
import { createRoot, type Root } from 'react-dom/client';
import { useStageTrace } from './useStageTrace';
import { StageTracePage } from './stageTracePage';
import { StageTraceTimeline } from './stageTraceTimeline';
import { readTraceGraderData } from './stageTraceGraderUtils';
import { StageTraceEventData } from './stageTraceEventData';

const mockDispatch = jest.fn();
let mockEnabled = true;
let mockQuery: Record<string, string> = {};
let mockProjectLoading = false;
let mockActiveProjectKey = 'project-key';
let mockActiveProject = { organizationSlug: 'org', projectSlug: 'project' };
const mockRoute = {
  organizationSlug: 'org',
  projectSlug: 'project',
  pipelineId: 7,
  iterationId: 31,
  stageKey: 'fix',
};
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ location: { payload: mockRoute } }),
}));
jest.mock('react-intl', () => ({
  defineMessages: (value: unknown) => value,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: Record<string, unknown>) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) =>
          text.replace(
            `{${key}}`,
            typeof value === 'string' || typeof value === 'number' ? String(value) : '',
          ),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('@reportportal/ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'data-automation-id': automationId,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    'data-automation-id'?: string;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} data-automation-id={automationId}>
      {children}
    </button>
  ),
  Dropdown: jest.fn(
    ({
      label,
      options,
      value,
      onChange,
    }: {
      label: string;
      options: { value: string; label: string }[];
      value: string;
      onChange: (value: unknown) => void;
    }) => (
      <label>
        {label}
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ),
  ),
  RefreshIcon: 'span',
  SystemMessage: 'section',
}));
jest.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({ getVirtualItems: () => [], getTotalSize: () => 0 }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: () => mockEnabled }));
jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_PAGE: 'DASHBOARD',
  PROJECT_PIPELINE_ITERATION_PAGE: 'ITERATION',
  PROJECT_PIPELINES_PAGE: 'PIPELINES',
  PROJECT_PIPELINE_STAGE_TRACE_PAGE: 'TRACE',
  pipelineIdSelector: () => mockRoute.pipelineId,
  iterationIdSelector: () => mockRoute.iterationId,
  stageKeySelector: () => mockRoute.stageKey,
  querySelector: () => mockQuery,
  urlOrganizationAndProjectSelector: () => mockRoute,
}));
jest.mock('controllers/project', () => ({
  projectKeySelector: () => 'project-key',
  projectNameSelector: () => 'My project',
  projectInfoLoadingSelector: () => mockProjectLoading,
}));
jest.mock('controllers/user', () => ({
  activeProjectKeySelector: () => mockActiveProjectKey,
  activeProjectSelector: () => mockActiveProject,
}));
jest.mock('layouts/settingsLayout', () => ({
  SettingsLayout: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('pages/inside/common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: ({
    title,
    breadcrumbDescriptors,
    actions,
    titleAddon,
  }: {
    title: ReactNode;
    breadcrumbDescriptors: { id: string; title: ReactNode; onClick?: () => void }[];
    actions: ReactNode;
    titleAddon: ReactNode;
  }) => (
    <header>
      <nav>
        {breadcrumbDescriptors.map((item) => (
          <button key={item.id} type="button" data-breadcrumb={item.id} onClick={item.onClick}>
            {item.title}
          </button>
        ))}
      </nav>
      <h1>{title}</h1>
      {titleAddon}
      {actions}
    </header>
  ),
}));
jest.mock('./useStageTrace', () => ({ useStageTrace: jest.fn() }));
jest.mock('./stageTraceSnapshot', () => ({ StageTraceSnapshot: () => null }));
const useTraceMock = jest.mocked(useStageTrace);
const readyState = {
  scope: 'project-key:31:fix',
  loading: false,
  attempts: [{ attempt: 1, traceStatus: 'REPORTED' as const, eventCount: 0, current: true }],
  trace: { iterationId: 31, stageKey: 'fix', attempt: 1, status: 'REPORTED' as const, events: [] },
};

const roots: Root[] = [];
const render = (node: ReactNode) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(node));
  return container;
};
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
});

// React 18 concurrent roots need this opt-in when using act without Enzyme's adapter.
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

describe('stage trace page states and navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnabled = true;
    mockRoute.stageKey = 'fix';
    mockQuery = {};
    mockProjectLoading = false;
    mockActiveProjectKey = 'project-key';
    mockActiveProject = { organizationSlug: 'org', projectSlug: 'project' };
    useTraceMock.mockReturnValue(readyState);
  });

  test('supports direct routes with a resolved active project and returns to the same stage', () => {
    const wrapper = render(<StageTracePage />);
    expect(useTraceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
        pipelineId: 7,
        resource: { projectKey: 'project-key', iterationId: 31, stageKey: 'fix' },
      }),
    );
    act(() =>
      wrapper
        .querySelector<HTMLButtonElement>('[data-automation-id="backFromStageTrace"]')
        ?.click(),
    );
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'ITERATION',
      payload: { organizationSlug: 'org', projectSlug: 'project', pipelineId: 7, iterationId: 31 },
      query: { stage: 'fix' },
    });
  });

  test('waits for project metadata while it is actually loading', () => {
    mockProjectLoading = true;
    const wrapper = render(<StageTracePage />);
    expect(useTraceMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(wrapper.textContent).toContain('Loading trace');
    expect(wrapper.querySelector('[role="alert"]')).toBeNull();
  });

  test.each(['key', 'route'])(
    'shows a settled project mismatch error for %s without requesting trace',
    (mismatch) => {
      if (mismatch === 'key') mockActiveProjectKey = 'other-project';
      else mockActiveProject = { organizationSlug: 'org', projectSlug: 'other' };
      const wrapper = render(<StageTracePage />);
      expect(useTraceMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
      expect(wrapper.querySelector('[role="alert"]')).not.toBeNull();
      expect(wrapper.textContent).not.toContain('Loading trace');
    },
  );

  test('enables a direct target route after the active project finishes changing', () => {
    mockProjectLoading = true;
    mockActiveProjectKey = 'previous-project';
    mockActiveProject = { organizationSlug: 'org', projectSlug: 'previous' };
    const container = document.createElement('div');
    const root = createRoot(container);
    roots.push(root);
    act(() => root.render(<StageTracePage />));
    expect(useTraceMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false }));
    mockProjectLoading = false;
    mockActiveProjectKey = 'project-key';
    mockActiveProject = { organizationSlug: 'org', projectSlug: 'project' };
    act(() => root.render(<StageTracePage />));
    expect(useTraceMock).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: true }));
    expect(container.textContent).not.toContain('Loading trace');
  });

  test.each(['fix', 'test-case-fix'])(
    'preserves source context and round header for %s trace',
    (stageKey) => {
      mockRoute.stageKey = stageKey;
      mockQuery = {
        returnPipelineId: '8',
        returnIterationId: '29',
        returnStageKey: 'review',
        fixRoundNumber: '4',
      };
      const wrapper = render(<StageTracePage />);
      expect(wrapper.querySelector('h1')?.textContent).toContain('fix round 4');
      act(() =>
        wrapper
          .querySelector<HTMLButtonElement>('[data-automation-id="backFromStageTrace"]')
          ?.click(),
      );
      expect(mockDispatch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ pipelineId: 8, iterationId: 29 }),
          query: { stage: 'review' },
        }),
      );
    },
  );

  test('redirects with the feature off and disables trace loading', () => {
    mockEnabled = false;
    const wrapper = render(<StageTracePage />);
    expect(useTraceMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DASHBOARD',
      payload: { organizationSlug: 'org', projectSlug: 'project' },
    });
    expect(wrapper.childElementCount).toBe(0);
  });

  test.each([
    ['FORBIDDEN', 'You do not have access to this trace'],
    ['NOT_FOUND', 'This iteration, stage or attempt was not found'],
    ['INVALID_RESPONSE', 'The trace address or server response is invalid'],
    ['REQUEST_FAILED', 'Trace could not be loaded. Refresh to try again.'],
  ] as const)('explains %s separately from not reported', (failure, text) => {
    useTraceMock.mockReturnValue({ scope: 'scope', loading: false, failure });
    const wrapper = render(<StageTracePage />);
    expect(wrapper.querySelector('[role="alert"]')?.textContent).toContain(text);
    expect(wrapper.textContent).not.toContain('Trace not reported');
  });

  test('shows the producer reason for not reported and distinguishes a reported empty trace', () => {
    useTraceMock.mockReturnValue({
      ...readyState,
      trace: { ...readyState.trace, status: 'NOT_REPORTED', reason: 'Agent output was empty' },
    });
    const notReported = render(<StageTracePage />);
    expect(notReported.textContent).toContain('Trace not reported');
    expect(notReported.textContent).toContain('Agent output was empty');
    useTraceMock.mockReturnValue(readyState);
    expect(render(<StageTracePage />).textContent).toContain(
      'The reported trace contains no events',
    );
  });

  test('rejects malformed attempt addresses before loading', () => {
    mockQuery = { attempt: '-1' };
    const wrapper = render(<StageTracePage />);
    expect(useTraceMock).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(wrapper.textContent).toContain('The trace address or server response is invalid');
  });

  test('breadcrumbs identify the project, catalog, trace iteration and selected stage independently from the source back-link', () => {
    mockQuery = { returnPipelineId: '8', returnIterationId: '29', returnStageKey: 'review' };
    const wrapper = render(<StageTracePage />);
    expect(wrapper.querySelector('[data-breadcrumb="project"]')?.textContent).toBe('My project');
    expect(wrapper.querySelector('[data-breadcrumb="iteration"]')?.textContent).toContain('31');
    expect(wrapper.querySelector('[data-breadcrumb="trace"]')?.textContent).toBe('fix');
    act(() => wrapper.querySelector<HTMLButtonElement>('[data-breadcrumb="iteration"]')?.click());
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'ITERATION',
      payload: { organizationSlug: 'org', projectSlug: 'project', pipelineId: 7, iterationId: 31 },
      query: { stage: 'fix' },
    });
    act(() => wrapper.querySelector<HTMLButtonElement>('[data-breadcrumb="pipelines"]')?.click());
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'PIPELINES',
      payload: { organizationSlug: 'org', projectSlug: 'project' },
    });
    act(() =>
      wrapper
        .querySelector<HTMLButtonElement>('[data-automation-id="backFromStageTrace"]')
        ?.click(),
    );
    expect(mockDispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ pipelineId: 8, iterationId: 29 }),
        query: { stage: 'review' },
      }),
    );
  });

  test('attempt navigation keeps fix-round and back-link context', () => {
    mockQuery = { fixRoundNumber: '4', returnIterationId: '29' };
    useTraceMock.mockReturnValue({
      ...readyState,
      attempts: [
        { ...readyState.attempts[0], current: false },
        { ...readyState.attempts[0], attempt: 2 },
      ],
    });
    const wrapper = render(<StageTracePage />);
    const select = wrapper.querySelector('select');
    if (!select) throw new Error('Attempt selector missing');
    act(() => {
      select.value = '2';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(mockDispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'TRACE', query: { ...mockQuery, attempt: '2' } }),
    );
  });
});

describe('trace event disclosure', () => {
  test('keeps full payload out of collapsed events, renders it only on expansion, and escapes HTML', () => {
    const text = `<img src=x onerror=alert(1)>${'x'.repeat(300_000)}tail`;
    const wrapper = render(
      <StageTraceTimeline
        events={[
          {
            seq: 0,
            type: 'TOOL_CALL',
            title: 'Read',
            target: 'README.md',
            text,
            offsetMs: 0,
            durationMs: 0,
            data: { score: 0 },
          },
        ]}
      />,
    );
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')).toHaveLength(0);
    expect(wrapper.textContent).not.toContain('README.md');
    expect(wrapper.querySelector('button')?.getAttribute('aria-expanded')).toBe('false');
    expect(wrapper.querySelector('button')?.hasAttribute('aria-controls')).toBe(false);
    expect(wrapper.textContent).toContain('+0 ms');
    act(() => wrapper.querySelector('button')?.click());
    expect(wrapper.querySelector('button')?.getAttribute('aria-expanded')).toBe('true');
    const contentId = wrapper.querySelector('button')?.getAttribute('aria-controls');
    expect(Array.from(wrapper.querySelectorAll('[id]')).some((node) => node.id === contentId)).toBe(
      true,
    );
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')[0].value).toBe(text);
    expect(wrapper.querySelectorAll('img')).toHaveLength(0);
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')[1].value).toContain(
      '"score": 0',
    );
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')[0].tabIndex).toBe(0);
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')[0].readOnly).toBe(true);
    act(() => wrapper.querySelector('button')?.click());
    expect(wrapper.querySelectorAll<HTMLTextAreaElement>('textarea')).toHaveLength(0);
  });
});

describe('grader trace presentation', () => {
  const discloseJson = (container: HTMLElement) => {
    const details = container.querySelector('details');
    if (!details) throw new Error('Raw data disclosure missing');
    act(() => {
      details.open = true;
      details.dispatchEvent(new Event('toggle'));
    });
  };

  test('shows validated criteria, zero scores, and the exact reported total without recomputing it', () => {
    const data = {
      caseId: 'TC-12',
      before: 0,
      after: 88,
      total: 7,
      criteria: [
        { name: 'Expected results', score: 17, max: 20 },
        { name: 'Expected results', score: 0, max: 0 },
      ],
      extra: { preserved: true },
    };
    const wrapper = render(<StageTraceEventData event={{ seq: 0, type: 'GRADERS', data }} />);
    expect(wrapper.textContent).toContain('TC-12');
    expect(wrapper.textContent).toContain('0 → 88 / 100');
    expect(wrapper.textContent).toContain('7 / 100');
    expect(wrapper.textContent).not.toContain('17 / 100');
    expect(wrapper.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(wrapper.textContent).toContain('0 / 0');
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')).toBeNull();
    discloseJson(wrapper);
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      JSON.stringify(data, null, 2),
    );
  });

  test('does not invent totals or comparison endpoints when only criteria and one zero score were reported', () => {
    const wrapper = render(
      <StageTraceEventData
        event={{
          seq: 0,
          type: 'GRADERS',
          data: { before: 0, criteria: [{ name: 'Clarity', score: 2, max: 3 }] },
        }}
      />,
    );
    expect(wrapper.textContent).toContain('Score before');
    expect(wrapper.textContent).toContain('0 / 100');
    expect(wrapper.textContent).not.toContain('Total score');
    expect(wrapper.textContent).not.toContain('Score before → after');
  });

  test.each([
    { arbitrary: { nested: ['untouched'] } },
    {
      total: '90',
      before: Number.NaN,
      after: Number.POSITIVE_INFINITY,
      criteria: [{ name: 'invalid', score: '17', max: 20 }],
    },
    { criteria: [{ name: 'x'.repeat(513), score: 1, max: 2 }] },
  ])('falls back to complete raw JSON for unknown or invalid structured data %#', (data) => {
    const wrapper = render(<StageTraceEventData event={{ seq: 0, type: 'GRADERS', data }} />);
    expect(wrapper.querySelector('table')).toBeNull();
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      JSON.stringify(data, null, 2),
    );
  });

  test('caps structured criteria rows while preserving an oversized report in the raw disclosure', () => {
    const data = {
      caseId: 'TC-many',
      total: 0,
      criteria: Array.from({ length: 101 }, (_, index) => ({
        name: `Criterion ${index}`,
        score: 0,
        max: 20,
      })),
      opaque: { untouched: true },
    };
    const wrapper = render(<StageTraceEventData event={{ seq: 0, type: 'GRADERS', data }} />);
    expect(wrapper.textContent).toContain('0 / 100');
    expect(wrapper.querySelector('table')).toBeNull();
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')).toBeNull();
    discloseJson(wrapper);
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe(
      JSON.stringify(data, null, 2),
    );
  });

  test('keeps grader parsing permissive about duplicate names and zero values, without interpreting unknown fields', () => {
    expect(
      readTraceGraderData({
        total: 0,
        before: 0,
        after: 0,
        criteria: [{ name: '', score: 0, max: 0 }],
        unknown: 'retained in JSON',
      }),
    ).toEqual({ total: 0, before: 0, after: 0, criteria: [{ name: '', score: 0, max: 0 }] });
  });

  test('loads structured grader content only after expanding its event', () => {
    const wrapper = render(
      <StageTraceTimeline
        events={[
          {
            seq: 0,
            type: 'GRADERS',
            title: 'TC-12',
            text: '72 -> 88 / 100',
            data: { before: 72, after: 88, criteria: [{ name: 'Clarity', score: 17, max: 20 }] },
          },
        ]}
      />,
    );
    expect(wrapper.querySelector('table')).toBeNull();
    expect(wrapper.textContent).not.toContain('Clarity');
    act(() => wrapper.querySelector('button')?.click());
    expect(wrapper.querySelector('table')).not.toBeNull();
    expect(wrapper.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('72 -> 88 / 100');
    expect(wrapper.textContent).toContain('72 → 88 / 100');
  });
});

describe('attempt Dropdown contract', () => {
  test.each([0, 1])('hides the switcher with %s available attempts', (count) => {
    const wrapper = render(
      <StageTraceAttemptSwitcher
        attempts={readyState.attempts.slice(0, count)}
        onChange={jest.fn()}
      />,
    );
    expect(wrapper.childElementCount).toBe(0);
  });

  test('uses complete readable labels and accepts only an existing scalar string value', () => {
    const onChange = jest.fn();
    const attempts = [
      {
        attempt: 1,
        traceStatus: 'REPORTED' as const,
        eventCount: 1,
        current: false,
        stageStatus: 'Failed',
      },
      {
        attempt: 2,
        traceStatus: 'NOT_REPORTED' as const,
        eventCount: 0,
        current: true,
        stageStatus: 'Passed',
      },
    ];
    render(
      <StageTraceAttemptSwitcher attempts={attempts} selectedAttempt={2} onChange={onChange} />,
    );
    const props = jest.mocked(Dropdown).mock.calls.slice(-1)[0][0];
    expect(props.value).toBe('2');
    expect(props.options).toEqual([
      { value: '1', label: 'Attempt 1 · Failed · Trace reported' },
      { value: '2', label: 'Attempt 2 · current · Passed · Trace not reported' },
    ]);
    props.onChange?.(['1']);
    props.onChange?.(1);
    props.onChange?.('unknown');
    expect(onChange).not.toHaveBeenCalled();
    props.onChange?.('1');
    expect(onChange).toHaveBeenCalledWith('1');
  });
});
