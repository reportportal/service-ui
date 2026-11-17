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

import { adaptLivePipelineIterationDetail } from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';
import { StageTraceSnapshot } from './stageTraceSnapshot';

jest.mock('react-intl', () => ({
  defineMessages: (value: unknown) => value,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
  formatCost: (value: number) => `$${value.toFixed(2)}`,
  formatTokens: (value: number) => String(value),
}));
jest.mock('common/utils/timeDateUtils', () => ({
  formatDuration: (value: number) => `${value} ms`,
}));
const selected = (attempt: number): StageTraceAttempt => ({
  attempt,
  traceStatus: 'REPORTED',
  eventCount: 1,
  current: attempt === 2,
});
const iteration = adaptLivePipelineIterationDetail(
  {
    id: 31,
    pipelineId: 7,
    iterationNumber: 3,
    trigger: 'CI trigger',
    stages: [
      {
        id: 1,
        stageKey: 'fix',
        sequence: 1,
        attempt: 2,
        durationMillis: 9000,
        attributes: [{ key: 'model', value: 'current model' }],
        links: [{ type: 'RUN', label: 'Current CI', url: 'https://ci.example/2' }],
        attempts: [
          {
            attempt: 1,
            durationMillis: 0,
            attributes: [
              { key: 'model', value: 'old model' },
              { key: 'cost', value: '0', valueType: 'MONEY' },
              { key: 'tokens', value: '0', valueType: 'NUMBER' },
            ],
            links: [{ type: 'RUN', label: 'Old CI', url: 'https://ci.example/1' }],
          },
        ],
      },
    ],
  },
  7,
  31,
);

// React 18 concurrent roots need this opt-in when using act without Enzyme's adapter.
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});

describe('trace attempt snapshot', () => {
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
  test('shows selected attempt metadata and zero values without inheriting the current model or CI', () => {
    const wrapper = render(
      <StageTraceSnapshot iteration={iteration} stageKey="fix" attempt={selected(1)} />,
    );
    expect(wrapper.textContent).toContain('old model');
    expect(wrapper.textContent).toContain('0 ms');
    expect(wrapper.textContent).toContain('$0.00');
    expect(wrapper.textContent).not.toContain('current model');
    expect(wrapper.querySelector('a')?.getAttribute('href')).toBe('https://ci.example/1');
    expect(wrapper.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(wrapper.textContent).toContain('CI trigger');
  });

  test('shows the current snapshot only for the matching attempt', () => {
    const wrapper = render(
      <StageTraceSnapshot iteration={iteration} stageKey="fix" attempt={selected(2)} />,
    );
    expect(wrapper.textContent).toContain('current model');
    expect(wrapper.textContent).not.toContain('old model');
    expect(wrapper.querySelector('a')?.getAttribute('href')).toBe('https://ci.example/2');
  });

  test('explains missing historical metadata instead of substituting the current snapshot', () => {
    const wrapper = render(
      <StageTraceSnapshot iteration={iteration} stageKey="fix" attempt={selected(3)} />,
    );
    expect(wrapper.textContent).toContain('Snapshot for this attempt is unavailable');
    expect(wrapper.textContent).not.toContain('current model');
  });

  test('renders an unsafe CI scheme as plain text while preserving the rest of the snapshot', () => {
    const data = {
      ...iteration,
      stages: [
        {
          ...iteration.stages[0],
          links: [{ type: 'RUN' as const, label: 'Unsafe CI', url: 'javascript:alert(1)' }],
        },
      ],
    };
    const wrapper = render(
      <StageTraceSnapshot iteration={data} stageKey="fix" attempt={selected(2)} />,
    );
    expect(wrapper.textContent).toContain('Unsafe CI');
    expect(wrapper.querySelectorAll('a')).toHaveLength(0);
    expect(wrapper.textContent).toContain('current model');
  });
});
