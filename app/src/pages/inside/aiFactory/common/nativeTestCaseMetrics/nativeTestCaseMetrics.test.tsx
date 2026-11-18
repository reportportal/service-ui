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
import { getNativeTestCaseSummary } from 'common/utils/nativeTestCase';
import { NativeTestCaseMetrics } from './nativeTestCaseMetrics';
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...names: string[]) =>
      names.join(' '),
}));
jest.mock('./nativeMetricsIterationLink', () => ({
  NativeMetricsIterationLink: ({
    iterationId,
    iterationNumber,
  }: {
    iterationId: number;
    iterationNumber?: number;
  }) => <a href={`#iteration/${iterationId}`}>{iterationNumber}</a>,
}));

const roots: Root[] = [];
const render = (node: ReactNode) => {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(node));
  return { container, rerender: (next: ReactNode) => act(() => root.render(next)) };
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

test('renders producer criteria, generation metadata and zeros without inventing missing values', () => {
  const summary = getNativeTestCaseSummary({
    origin: 'AI',
    metrics: {
      evaluatedAt: 0,
      tokensIn: 0,
      tokensOut: 0,
      skill: 'fix_test_case',
      criteria: [
        { criterionId: 1, name: 'Clarity', score: 0, maxPoints: 0 },
        { criterionId: 2, name: 'Coverage', score: 7 },
      ],
      pipelineIterationId: 72,
      pipelineIterationNumber: 3,
    },
  });
  if (!summary) throw new Error('Native summary missing');
  const { container } = render(
    <IntlProvider locale="en">
      <NativeTestCaseMetrics summary={summary} testCaseId={42} />
    </IntlProvider>,
  );
  expect(container.textContent).toContain('Evaluated:');
  expect(container.textContent).toContain('Input tokens: 0');
  expect(container.textContent).toContain('Output tokens: 0');
  expect(container.textContent).toContain('Skill: fix_test_case');
  expect(container.textContent).toContain('Clarity: 0 / 0');
  expect(container.textContent).toContain('Coverage: 7');
  expect(container.querySelector('a')?.getAttribute('href')).toBe('#iteration/72');
  expect(container.textContent).not.toMatch(/cache|reason|share|undefined/);
});
test.each(['AI', 'MANUAL'] as const)('keeps absent metrics empty for %s cases', (origin) => {
  const summary = getNativeTestCaseSummary({ origin });
  if (!summary) throw new Error('Native summary missing');
  const { container } = render(
    <IntlProvider locale="en">
      <NativeTestCaseMetrics summary={summary} testCaseId={42} />
    </IntlProvider>,
  );
  expect(container.childElementCount).toBe(0);
});
test('keeps Manual cases free of stale AI metrics and hides absent optional fields', () => {
  const { container } = render(
    <IntlProvider locale="en">
      <NativeTestCaseMetrics
        summary={{ isAi: false, isObsolete: false, metrics: { tokensIn: 3 } }}
        testCaseId={42}
      />
    </IntlProvider>,
  );
  expect(container.childElementCount).toBe(0);
});
