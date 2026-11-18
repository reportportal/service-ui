/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IntlProvider } from 'react-intl';
import { loadLiveFixRoundHistory, type NativeFixRound } from '../liveFixRounds';
import { LiveFixRoundHistory } from './liveFixRoundHistory';
jest.mock('../liveFixRounds', () => ({ loadLiveFixRoundHistory: jest.fn() }));
let mockProjectKey = 'demo';
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('react-redux', () => ({ useSelector: () => mockProjectKey }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
jest.mock('@reportportal/ui-kit', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));
jest.mock(
  'pages/inside/aiFactory/iterationDetailsPage/stageTraceAction/liveFixTraceAction',
  () => ({
    LiveFixTraceAction: ({ resultIterationId }: { resultIterationId: number }) => (
      <a href={`#trace/${resultIterationId}`}>Open trace</a>
    ),
  }),
);

const roots: Root[] = [];
const render = (node: ReactNode) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(node));
  return { container, rerender: (next: ReactNode) => act(() => root.render(next)) };
};
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
beforeAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
});
afterAll(() => {
  actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
});
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
});

const round: NativeFixRound = {
  id: 11,
  testCaseId: 42,
  roundNumber: 2,
  previousIterationId: 31,
  status: 'FAILED',
  failureReason: 'Timeout',
};
const resource = {};
const view = (testCaseId = 42, resourceKey = resource, currentRound?: NativeFixRound) => (
  <IntlProvider locale="en">
    <LiveFixRoundHistory
      testCaseId={testCaseId}
      resourceKey={resourceKey}
      currentRound={currentRound}
    />
  </IntlProvider>
);
const clickLoad = (container: HTMLElement) => act(() => container.querySelector('button')?.click());
beforeEach(() => {
  jest.clearAllMocks();
  mockProjectKey = 'demo';
});

test('loads on demand and displays all failed rounds with a trace only for a reported result', async () => {
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([
    round,
    {
      ...round,
      id: 8,
      roundNumber: 1,
      resultIterationId: 70,
      requestedAt: '2026-11-18T09:00:00Z',
      finishedAt: '2026-11-18T09:10:00Z',
    },
  ]);
  const { container } = render(view());
  expect(loadLiveFixRoundHistory).not.toHaveBeenCalled();
  clickLoad(container);
  expect(container.textContent).toContain('Loading fix round history');
  await flush();
  expect(container.querySelectorAll('li')).toHaveLength(2);
  expect(container.textContent).toContain('Fix round #2');
  expect(container.textContent).toContain('Timeout');
  expect(container.textContent).toContain('No result iteration was reported');
  expect(container.querySelectorAll('a')).toHaveLength(1);
  expect(container.querySelector('a')?.getAttribute('href')).toBe('#trace/70');
  expect(container.textContent).toContain('Finished:');
});

test('shows a failed history read separately from empty and retries', async () => {
  jest
    .mocked(loadLiveFixRoundHistory)
    .mockRejectedValueOnce(new Error('403'))
    .mockResolvedValueOnce([]);
  const { container } = render(view());
  clickLoad(container);
  await flush();
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
  expect(container.textContent).not.toContain('No fix rounds have been requested');
  clickLoad(container);
  await flush();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.textContent).toContain('No fix rounds have been requested');
});

test('aborts and ignores a late response after the resource changes, keeping the next case lazy', async () => {
  let resolve!: (rounds: NativeFixRound[]) => void;
  jest.mocked(loadLiveFixRoundHistory).mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const { container, rerender } = render(view());
  clickLoad(container);
  await flush();
  const signal = jest.mocked(loadLiveFixRoundHistory).mock.calls[0][2];
  rerender(view(99, {}));
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolve([round]);
    await Promise.resolve();
  });
  expect(container.textContent).not.toContain('Fix round #2');
  expect(container.textContent).not.toContain('Loading fix round history');
  expect(loadLiveFixRoundHistory).toHaveBeenCalledTimes(1);
});

test('refreshes an opened history when a monitored round gains its result', async () => {
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([round]);
  const { container, rerender } = render(view(42, resource, round));
  clickLoad(container);
  await flush();
  jest.mocked(loadLiveFixRoundHistory).mockResolvedValue([{ ...round, resultIterationId: 77 }]);
  rerender(view(42, resource, { ...round, resultIterationId: 77 }));
  await flush();
  expect(loadLiveFixRoundHistory).toHaveBeenCalledTimes(2);
  expect(container.querySelector('a')?.getAttribute('href')).toBe('#trace/77');
});
