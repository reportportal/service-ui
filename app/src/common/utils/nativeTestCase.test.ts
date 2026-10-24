/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import type { TestCase } from 'types/testCase';
import {
  getNativeTestCaseSummary,
  getTestCasePresentation,
  hasNativeTestCaseData,
} from './nativeTestCase';

const nativeCase: Partial<TestCase> = {
  id: 9103,
  origin: 'AI',
  status: 'DRAFT',
  defaultVersionId: 8301,
  metrics: { overallScore: 72, obsolete: false, model: 'auto (default)', costUsd: 0.235 },
};

describe('native Test Case presentation', () => {
  test.each([null, undefined, {}, { id: 1, name: 'Legacy case' }])(
    'does not infer native AI metadata from an undocumented case: %p',
    (testCase) => {
      expect(hasNativeTestCaseData(testCase)).toBe(false);
      expect(getNativeTestCaseSummary(testCase)).toBeUndefined();
    },
  );

  test.each<Partial<TestCase>>([
    { origin: 'MANUAL' },
    { status: 'READY' },
    { defaultVersionId: 1 },
    { metrics: null },
  ])('recognizes an explicit native field without requiring AI metrics: %p', (testCase) => {
    expect(hasNativeTestCaseData(testCase)).toBe(true);
  });

  test('reads the documented current version summary without manufacturing provenance', () => {
    expect(getNativeTestCaseSummary(nativeCase)).toEqual({
      isAi: true,
      status: 'DRAFT',
      score: 72,
      isObsolete: false,
      model: 'auto (default)',
      costUsd: 0.235,
    });
  });

  test('preserves zero score and cost and the obsolete state for a Ready AI case', () => {
    expect(
      getNativeTestCaseSummary({
        ...nativeCase,
        status: 'READY',
        metrics: { overallScore: 0, obsolete: true, costUsd: 0 },
      }),
    ).toEqual({
      isAi: true,
      status: 'READY',
      score: 0,
      isObsolete: true,
      model: undefined,
      costUsd: 0,
    });
  });

  test.each([undefined, null, {}])('handles missing optional metrics: %p', (metrics) => {
    expect(getNativeTestCaseSummary({ ...nativeCase, metrics })).toEqual({
      isAi: true,
      status: 'DRAFT',
      score: undefined,
      isObsolete: false,
      model: undefined,
      costUsd: undefined,
    });
  });

  test.each([-1, NaN, Infinity, -Infinity, '72', null])(
    'does not show invalid score or cost values: %p',
    (value) => {
      const testCase = {
        ...nativeCase,
        metrics: { overallScore: value, costUsd: value, obsolete: 'true', model: '   ' },
      } as unknown as Partial<TestCase>;

      expect(getNativeTestCaseSummary(testCase)).toMatchObject({
        score: undefined,
        costUsd: undefined,
        isObsolete: false,
        model: undefined,
      });
    },
  );

  test('keeps Manual origin free of stale AI metrics and unknown status', () => {
    const testCase = { ...nativeCase, origin: 'MANUAL', status: 'ARCHIVED' } as unknown as TestCase;

    expect(getNativeTestCaseSummary(testCase)).toEqual({
      isAi: false,
      status: undefined,
      score: undefined,
      costUsd: undefined,
      isObsolete: false,
      model: undefined,
    });
  });

  test('prefers native backend fields over stale mock fields without mutating the source', () => {
    const testCase = {
      ...nativeCase,
      lifecycle: 'READY',
      ai: { modifiedByAgent: true },
      evaluationSummary: { totalScore: 94 },
      costSummary: { approxTotal: 3 },
      review: { unsentCommentsCount: 2 },
      automation: { status: 'AUTOMATED' },
      blockedPlans: [{ id: 1 }],
    } as unknown as TestCase;

    const presentation = getTestCasePresentation(testCase, true);

    expect(presentation).toEqual(nativeCase);
    expect(testCase).toHaveProperty('lifecycle', 'READY');
    expect(testCase).toHaveProperty('ai.modifiedByAgent', true);
  });

  test('retains the original native case when the feature is disabled', () => {
    const testCase = { ...nativeCase, lifecycle: 'READY' } as unknown as TestCase;

    expect(getTestCasePresentation(testCase, false)).toBe(testCase);
  });

  test('retains legacy mock fixtures when no native fields are present', () => {
    const testCase = {
      id: 1,
      lifecycle: 'READY',
      ai: { modifiedByAgent: true },
    } as unknown as TestCase;

    expect(getTestCasePresentation(testCase, true)).toBe(testCase);
  });
});
