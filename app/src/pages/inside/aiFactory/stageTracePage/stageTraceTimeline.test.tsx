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
import { createRoot, type Root } from 'react-dom/client';
import type { ReducedPipelineSection } from 'controllers/aiFactory/pipelines/liveAdapters';
import { adaptLivePipelineIterationDetail } from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceEvent } from 'controllers/aiFactory/stageTrace';
import { StageTraceTimeline } from './stageTraceTimeline';
import { StageTraceContent } from './stageTraceContent';
import type { StageTraceState } from './useStageTrace';

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
  Dropdown: ({
    label,
    options,
    value,
    onChange,
  }: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
  SystemMessage: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
jest.mock('./stageTraceSnapshot', () => ({ StageTraceSnapshot: () => null }));

const unitSections = (name = 'Checkout case'): ReducedPipelineSection[] => [
  {
    key: 'units',
    title: 'Units',
    role: 'RESULT',
    columns: [{ key: 'name', label: 'Name' }],
    rows: [{ key: 'case-1', cells: { name }, details: [] }],
  },
];
const events: StageTraceEvent[] = [
  { seq: 0, type: 'START', title: 'Stage start' },
  { seq: 2, type: 'STEP', title: 'Known unit', unitKey: 'case-1', text: 'Unit payload' },
  { seq: 8, type: 'STEP', title: 'Unknown unit', unitKey: 'missing' },
];
const roots: Root[] = [];
const render = (node: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(node));
  return { container, rerender: (next: ReactNode) => act(() => root.render(next)) };
};
const selectFilter = (container: HTMLElement, value: string) => {
  const selector = container.querySelector<HTMLSelectElement>('select[aria-label="Unit"]');
  if (!selector) throw new Error('Unit filter is missing');
  act(() => {
    selector.value = value;
    selector.dispatchEvent(new Event('change', { bubbles: true }));
  });
};
const titles = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('article button')).map((button) => button.textContent);

// Supply only browser geometry missing in jsdom; the production virtualizer runs unchanged.
const environment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousAct = environment.IS_REACT_ACT_ENVIRONMENT;
let heightSpy: jest.SpyInstance;
let widthSpy: jest.SpyInstance;
beforeAll(() => {
  environment.IS_REACT_ACT_ENVIRONMENT = true;
  heightSpy = jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockImplementation(function getHeight(this: HTMLElement) {
      return this.classList.contains('timeline__scroll') ? 280 : 56;
    });
  widthSpy = jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(900);
});
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  document.body.replaceChildren();
});
afterAll(() => {
  heightSpy.mockRestore();
  widthSpy.mockRestore();
  environment.IS_REACT_ACT_ENVIRONMENT = previousAct;
});

describe('trace transcript unit selection', () => {
  test('labels matched events, keeps unknown events at Stage, and filters without changing sparse order', () => {
    const { container } = render(<StageTraceTimeline events={events} sections={unitSections()} />);
    expect(titles(container)).toEqual([
      expect.stringContaining('StageStage start'),
      expect.stringContaining('Checkout caseKnown unit'),
      expect.stringContaining('StageUnknown unit'),
    ]);
    selectFilter(container, 'stage');
    expect(titles(container)).toEqual([
      expect.stringContaining('Stage start'),
      expect.stringContaining('Unknown unit'),
    ]);
    selectFilter(container, 'unit:case-1');
    expect(titles(container)).toEqual([expect.stringContaining('Known unit')]);
    selectFilter(container, 'all');
    expect(
      Array.from(container.querySelectorAll('article button')).map((button) =>
        button.getAttribute('data-automation-id'),
      ),
    ).toEqual(['traceEvent-0', 'traceEvent-2', 'traceEvent-8']);
  });

  test('escapes the producer unit label instead of interpreting HTML', () => {
    const label = '<img src=x onerror=alert(1)>Checkout';
    const { container } = render(
      <StageTraceTimeline events={events} sections={unitSections(label)} />,
    );
    expect(titles(container)[1]).toContain(label);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('option[value="unit:case-1"]')?.textContent).toBe(label);
  });

  test('resets a removed unit filter to All and retains every event when metadata disappears', () => {
    const { container, rerender } = render(
      <StageTraceTimeline events={events} sections={unitSections()} />,
    );
    selectFilter(container, 'unit:case-1');
    expect(container.querySelectorAll('article')).toHaveLength(1);
    rerender(<StageTraceTimeline events={events} />);
    expect(container.querySelector<HTMLSelectElement>('select')?.value).toBe('all');
    expect(container.querySelectorAll('article')).toHaveLength(3);
    expect(titles(container).every((title) => title?.includes('Stage'))).toBe(true);
    selectFilter(container, 'stage');
    expect(container.querySelectorAll('article')).toHaveLength(3);
  });

  test('explains a valid unit that has no events', () => {
    const { container } = render(
      <StageTraceTimeline events={[events[0]]} sections={unitSections()} />,
    );
    selectFilter(container, 'unit:case-1');
    expect(container.querySelectorAll('article')).toHaveLength(0);
    expect(container.textContent).toContain('No events match this unit filter');
  });

  test('returns a scrolled virtual trace to its filtered first row and preserves disclosure identity by seq', () => {
    const large = Array.from(
      { length: 250 },
      (_, index): StageTraceEvent => ({
        seq: index * 3,
        type: 'STEP',
        title: `Event ${index}`,
        text: `Payload ${index}`,
        ...(index % 2 === 0 ? { unitKey: 'case-1' } : {}),
      }),
    );
    const { container } = render(<StageTraceTimeline events={large} sections={unitSections()} />);
    const first = container.querySelector<HTMLButtonElement>('[data-automation-id="traceEvent-0"]');
    expect(first).not.toBeNull();
    act(() => first?.click());
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('Payload 0');
    const scroll = container.querySelector<HTMLDivElement>('.timeline__scroll');
    if (!scroll) throw new Error('Scroll viewport is missing');
    act(() => {
      scroll.scrollTop = 5600;
      scroll.dispatchEvent(new Event('scroll'));
    });
    expect(container.querySelector('[data-automation-id="traceEvent-300"]')).not.toBeNull();
    expect(container.querySelector('[data-automation-id="traceEvent-0"]')).toBeNull();
    selectFilter(container, 'unit:case-1');
    act(() => scroll.dispatchEvent(new Event('scroll')));
    expect(scroll.scrollTop).toBe(0);
    expect(container.querySelector('[data-automation-id="traceEvent-0"]')).not.toBeNull();
    expect(
      container.querySelector('[data-automation-id="traceEvent-0"]')?.getAttribute('aria-expanded'),
    ).toBe('true');
    expect(container.querySelector<HTMLTextAreaElement>('textarea')?.value).toBe('Payload 0');
    expect(container.querySelectorAll('article').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('article').length).toBeLessThan(125);
    expect(
      Array.from(container.querySelectorAll('article button')).every(
        (button) =>
          Number(button.getAttribute('data-automation-id')?.replace('traceEvent-', '')) % 6 === 0,
      ),
    ).toBe(true);
    expect(
      container.querySelector('[data-automation-id="traceEvent-6"]')?.getAttribute('aria-expanded'),
    ).toBe('false');
  });
});

const contentState = (attempt: number): StageTraceState => {
  const iteration = adaptLivePipelineIterationDetail(
    {
      id: 31,
      pipelineId: 7,
      iterationNumber: 3,
      stages: [
        {
          id: 1,
          stageKey: 'fix',
          sequence: 1,
          attempt: 2,
          sections: unitSections('Current checkout'),
          attempts: [
            {
              attempt: 1,
              status: 'FAILED',
              sections: [
                {
                  key: 'units',
                  title: 'Units',
                  role: 'RESULT',
                  columns: [{ key: 'duration', label: 'Duration', valueType: 'DURATION' }],
                  rows: [{ key: 'case-1', cells: { unit: { value: 'Historic checkout' } } }],
                },
              ],
            },
          ],
        },
      ],
    },
    7,
    31,
  );
  return {
    scope: `project:31:fix:${attempt}`,
    loading: false,
    iteration,
    trace: { iterationId: 31, stageKey: 'fix', attempt, status: 'REPORTED', events },
  };
};
const content = (attempt: number, state = contentState(attempt)) => (
  <StageTraceContent
    state={state}
    stageKey="fix"
    isLoading={false}
    attempt={{ attempt, traceStatus: 'REPORTED', eventCount: 3, current: attempt === 2 }}
  />
);

describe('unit metadata from the selected attempt', () => {
  test('uses historic unit names and resets the filter on attempt changes', () => {
    const { container, rerender } = render(content(1));
    expect(container.querySelector('option[value="unit:case-1"]')?.textContent).toBe(
      'Historic checkout',
    );
    expect(container.textContent).not.toContain('Current checkout');
    selectFilter(container, 'unit:case-1');
    rerender(content(2));
    expect(container.querySelector<HTMLSelectElement>('select')?.value).toBe('all');
    expect(container.querySelector('option[value="unit:case-1"]')?.textContent).toBe(
      'Current checkout',
    );
    expect(container.textContent).not.toContain('Historic checkout');
  });

  test('keeps historical events at Stage when the historical snapshot is missing', () => {
    const { container } = render(content(3));
    expect(container.querySelector('option[value="unit:case-1"]')).toBeNull();
    expect(container.textContent).not.toContain('Current checkout');
    expect(container.textContent).not.toContain('Historic checkout');
    expect(container.querySelectorAll('article')).toHaveLength(3);
    expect(titles(container).every((title) => title?.includes('Stage'))).toBe(true);
  });
});
