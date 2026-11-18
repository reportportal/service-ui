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
import { fetch } from 'common/utils';
import { NativeMetricsIterationLink } from './nativeMetricsIterationLink';
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
const mockDispatch = jest.fn();
let mockProjectKey = 'demo';
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_ITERATION_PAGE: 'ITERATION',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: unknown) =>
    selector ===
    jest.requireMock<typeof import('controllers/project')>('controllers/project').projectKeySelector
      ? mockProjectKey
      : { organizationSlug: 'org', projectSlug: 'demo' },
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

const fetchMock = fetch as jest.MockedFunction<
  (url: string, options?: Record<string, unknown>) => Promise<unknown>
>;
const view = (id = 72) => (
  <IntlProvider locale="en">
    <NativeMetricsIterationLink testCaseId={42} iterationId={id} iterationNumber={3} />
  </IntlProvider>
);
beforeEach(() => {
  jest.clearAllMocks();
  mockProjectKey = 'demo';
});
test('loads identity only on click and routes by confirmed IDs rather than the displayed ordinal', async () => {
  fetchMock.mockResolvedValue({ id: 72, pipelineId: 8, iterationNumber: 3 });
  const { container } = render(view());
  expect(fetchMock).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Iteration #3');
  act(() => container.querySelector('button')?.click());
  await flush();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringMatching(/iteration\/72$/),
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  expect(mockDispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      payload: { organizationSlug: 'org', projectSlug: 'demo', pipelineId: 8, iterationId: 72 },
    }),
  );
});
test.each(['iteration', 'project'])(
  'ignores the previous response after switching %s and aborts it',
  async (scope) => {
    let resolve!: (value: unknown) => void;
    fetchMock.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { container, rerender } = render(view());
    act(() => container.querySelector('button')?.click());
    await flush();
    const signal = fetchMock.mock.calls[0][1]?.signal as AbortSignal;
    if (scope === 'project') mockProjectKey = 'other';
    rerender(view(scope === 'iteration' ? 99 : 72));
    expect(signal.aborted).toBe(true);
    await act(async () => {
      resolve({ id: 72, pipelineId: 8, iterationNumber: 3 });
      await Promise.resolve();
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(container.textContent).not.toContain('Loading iteration');
  },
);
test.each(['error', 'wrong-id'])(
  'does not navigate on %s and provides a readable state',
  async (failure) => {
    if (failure === 'error') fetchMock.mockRejectedValue(new Error('403'));
    else fetchMock.mockResolvedValue({ id: 999, pipelineId: 8, iterationNumber: 3 });
    const { container } = render(view());
    act(() => container.querySelector('button')?.click());
    await flush();
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(container.textContent).toMatch(/could not be loaded|unavailable/);
  },
);
