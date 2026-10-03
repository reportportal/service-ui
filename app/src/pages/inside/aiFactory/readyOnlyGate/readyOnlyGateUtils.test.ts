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

import { Lifecycle } from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

import {
  formatSkippedDrafts,
  getTestPlanLaunchGate,
  isDraftGateActive,
  partitionReadyOnlySelection,
} from './readyOnlyGateUtils';

const readyCase = {
  id: 1,
  displayId: 'TC1',
  name: 'Ready case',
  lifecycle: Lifecycle.READY,
} as TestCase;
const draftCase = {
  id: 2,
  displayId: 'TC2',
  name: 'Draft case',
  lifecycle: Lifecycle.DRAFT,
} as TestCase;

describe('ready-only gate utils', () => {
  test('activates only for Draft while the feature is enabled', () => {
    expect(isDraftGateActive(true, Lifecycle.DRAFT)).toBe(true);
    expect(isDraftGateActive(true, Lifecycle.READY)).toBe(false);
    expect(isDraftGateActive(false, Lifecycle.DRAFT)).toBe(false);
  });

  test('keeps Ready cases and reports Draft cases in a mixed bulk selection', () => {
    expect(partitionReadyOnlySelection([1, 2], [readyCase, draftCase], true)).toEqual({
      eligibleIds: [1],
      skippedDrafts: [draftCase],
    });
  });

  test('preserves existing bulk behavior while the feature is disabled', () => {
    expect(partitionReadyOnlySelection([1, 2], [readyCase, draftCase], false)).toEqual({
      eligibleIds: [1, 2],
      skippedDrafts: [],
    });
  });

  test('formats every skipped Draft with its business id and name', () => {
    expect(formatSkippedDrafts([draftCase])).toBe('TC2 — Draft case');
  });

  test('uses the plan-level G2 gate and maps Draft links to loaded real case ids', () => {
    expect(
      getTestPlanLaunchGate(
        true,
        {
          draftTestCasesCount: 1,
          draftTestCases: [{ id: 1002, displayId: 'TC2' }],
          launchBlocked: true,
        },
        [readyCase, draftCase],
      ),
    ).toEqual({
      draftCount: 1,
      draftTestCases: [{ id: 2, displayId: 'TC2' }],
      isBlocked: true,
    });
  });

  test('falls back to loaded C1 rows when G2 data is not available', () => {
    expect(getTestPlanLaunchGate(true, undefined, [readyCase, draftCase])).toEqual({
      draftCount: 1,
      draftTestCases: [{ id: 2, displayId: 'TC2' }],
      isBlocked: true,
    });
  });

  test('preserves the current Test Plan behavior while the feature is disabled', () => {
    expect(
      getTestPlanLaunchGate(false, { draftTestCasesCount: 1, launchBlocked: true }, [draftCase]),
    ).toEqual({ draftCount: 0, draftTestCases: [], isBlocked: false });
  });
});
