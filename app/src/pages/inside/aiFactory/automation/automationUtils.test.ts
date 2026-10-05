/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { AutomationStatus, Lifecycle, SkipReason } from 'types/aiFactory';

import {
  getAutomationCandidateLabel,
  getAutomationSkipReason,
  normalizeAutomateAccepted,
  normalizeAutomationEnvironments,
  partitionAutomationSelection,
  type AutomationCandidate,
} from './automationUtils';

const candidate = (overrides: Partial<AutomationCandidate> = {}): AutomationCandidate => ({
  id: 42,
  displayId: 'TC42',
  name: 'Checkout',
  lifecycle: Lifecycle.READY,
  ...overrides,
});

describe('automation selection', () => {
  test('treats only an explicitly Ready case as eligible', () => {
    expect(getAutomationSkipReason(candidate())).toBeNull();
    expect(getAutomationSkipReason(candidate({ lifecycle: Lifecycle.DRAFT }))).toBe(
      SkipReason.NOT_READY,
    );
    expect(getAutomationSkipReason(candidate({ lifecycle: undefined }))).toBe(
      SkipReason.NOT_READY,
    );
  });

  test('uses deterministic fix-running then automation-running then lifecycle precedence', () => {
    const allBlocked = candidate({
      lifecycle: Lifecycle.DRAFT,
      review: { unsentCommentsCount: 0, fixRound: { number: 2, status: 'RUNNING' } },
      automation: { status: AutomationStatus.IN_PROGRESS },
    });

    expect(getAutomationSkipReason(allBlocked)).toBe(SkipReason.FIX_RUNNING);
    expect(getAutomationSkipReason({ ...allBlocked, review: undefined })).toBe(
      SkipReason.AUTOMATION_IN_PROGRESS,
    );
    expect(
      getAutomationSkipReason({ ...allBlocked, review: undefined, automation: undefined }),
    ).toBe(SkipReason.NOT_READY);
  });

  test('partitions mixed candidates and requests confirmation only for eligible automated cases', () => {
    const ready = candidate();
    const automated = candidate({
      id: 43,
      automation: { status: AutomationStatus.AUTOMATED },
    });
    const skippedAutomated = candidate({
      id: 44,
      lifecycle: Lifecycle.DRAFT,
      automation: { status: AutomationStatus.AUTOMATED },
    });

    expect(partitionAutomationSelection([ready, automated, skippedAutomated])).toEqual({
      eligible: [ready, automated],
      skipped: [{ ...skippedAutomated, reason: SkipReason.NOT_READY }],
      requiresReautomation: true,
    });
    expect(partitionAutomationSelection([ready, skippedAutomated]).requiresReautomation).toBe(
      false,
    );
  });

  test('builds stable candidate labels with progressively safer fallbacks', () => {
    expect(getAutomationCandidateLabel(candidate())).toBe('TC42 · Checkout');
    expect(getAutomationCandidateLabel(candidate({ name: undefined }))).toBe('TC42');
    expect(getAutomationCandidateLabel(candidate({ displayId: undefined, name: undefined }))).toBe(
      '42',
    );
  });
});

describe('normalizeAutomationEnvironments', () => {
  test('accepts a valid response, preserves order and removes duplicates', () => {
    expect(
      normalizeAutomationEnvironments({
        environments: ['beta5', 'qa', 'beta5'],
        default: 'qa',
      }),
    ).toEqual({ environments: ['beta5', 'qa'], default: 'qa' });
  });

  test.each([
    null,
    {},
    { environments: [], default: 'qa' },
    { environments: ['qa', ''], default: 'qa' },
    { environments: ['qa', 1], default: 'qa' },
    { environments: ['qa'], default: 'dev' },
    { environments: ['qa'], default: 1 },
  ])('rejects malformed A1 input %#', (value) => {
    expect(normalizeAutomationEnvironments(value)).toBeNull();
  });
});

describe('normalizeAutomateAccepted', () => {
  const requestedIds = [42, 43, 44];
  const response = {
    iteration: { pipelineId: 2, iterationId: 201, number: 1 },
    accepted: [42, 43],
    skipped: [{ id: 44, displayId: 'TC44', reason: SkipReason.NOT_READY }],
  };

  test('accepts a complete A2 response', () => {
    expect(normalizeAutomateAccepted(response, requestedIds)).toEqual(response);
  });

  test.each([
    null,
    {},
    { ...response, iteration: { ...response.iteration, pipelineId: 0 } },
    { ...response, iteration: { ...response.iteration, iterationId: 1.5 } },
    { ...response, accepted: [] },
    { ...response, accepted: [42, 42] },
    { ...response, accepted: [0] },
    { ...response, accepted: [42, 99] },
    { ...response, accepted: [42], skipped: [] },
    {
      ...response,
      skipped: [
        { id: 44, displayId: 'TC44', reason: SkipReason.NOT_READY },
        { id: 44, displayId: 'TC44', reason: SkipReason.FIX_RUNNING },
      ],
    },
    {
      ...response,
      skipped: [{ id: 43, displayId: 'TC43', reason: SkipReason.NOT_READY }],
    },
    { ...response, skipped: null },
    { ...response, skipped: [{ id: 44, displayId: 44, reason: SkipReason.NOT_READY }] },
    { ...response, skipped: [{ id: 44, displayId: 'TC44', reason: 'UNKNOWN' }] },
  ])('rejects malformed A2 input %#', (value) => {
    expect(normalizeAutomateAccepted(value, requestedIds)).toBeNull();
  });

  test.each([{ ids: [] }, { ids: [42, 42, 44] }])(
    'rejects an invalid requested ID set %#',
    ({ ids }) => {
    expect(normalizeAutomateAccepted(response, ids)).toBeNull();
    },
  );
});
