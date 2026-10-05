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

import { Lifecycle, type AiLifecycle } from 'types/aiFactory';
import type { TestCase } from 'types/testCase';

export type ReadyOnlyTestCase = Pick<TestCase, 'id'> &
  Partial<Pick<TestCase, 'displayId' | 'lifecycle' | 'name'>>;

export interface ReadyOnlySelection {
  eligibleIds: number[];
  skippedDrafts: ReadyOnlyTestCase[];
}

interface TestPlanLaunchGateSource {
  draftTestCasesCount?: number;
  draftTestCases?: { id: number; displayId: string }[];
  launchBlocked?: boolean;
}

export interface TestPlanLaunchGate {
  draftCount: number;
  draftTestCases: { id: number; displayId: string }[];
  isBlocked: boolean;
}

export const isDraftGateActive = (isAiFactoryEnabled: boolean, lifecycle?: AiLifecycle): boolean =>
  isAiFactoryEnabled && lifecycle === Lifecycle.DRAFT;

export const partitionReadyOnlySelection = (
  selectedIds: number[],
  testCases: ReadyOnlyTestCase[],
  isAiFactoryEnabled: boolean,
): ReadyOnlySelection => {
  if (!isAiFactoryEnabled) {
    return { eligibleIds: selectedIds, skippedDrafts: [] };
  }

  const testCasesById = new Map(testCases.map((testCase) => [testCase.id, testCase]));
  const skippedDrafts: ReadyOnlyTestCase[] = [];
  const eligibleIds = selectedIds.filter((id) => {
    const testCase = testCasesById.get(id);
    if (testCase?.lifecycle === Lifecycle.DRAFT) {
      skippedDrafts.push(testCase);
      return false;
    }

    return true;
  });

  return { eligibleIds, skippedDrafts };
};

export const formatSkippedDrafts = (testCases: ReadyOnlyTestCase[]): string =>
  testCases
    .map(({ displayId, id, name }) => [displayId ?? id, name].filter(Boolean).join(' — '))
    .join(', ');

export const getTestPlanLaunchGate = (
  isAiFactoryEnabled: boolean,
  testPlan: TestPlanLaunchGateSource | null | undefined,
  loadedTestCases: TestCase[],
): TestPlanLaunchGate => {
  if (!isAiFactoryEnabled) {
    return { draftCount: 0, draftTestCases: [], isBlocked: false };
  }

  const loadedDrafts = loadedTestCases.filter(({ lifecycle }) => lifecycle === Lifecycle.DRAFT);
  const contractDrafts = testPlan?.draftTestCases ?? loadedDrafts;
  const draftTestCases = contractDrafts.map((draftTestCase) => {
    const loadedTestCase = loadedTestCases.find(
      ({ displayId }) => displayId === draftTestCase.displayId,
    );
    return loadedTestCase
      ? { id: loadedTestCase.id, displayId: loadedTestCase.displayId }
      : { id: draftTestCase.id, displayId: draftTestCase.displayId };
  });
  const draftCount = testPlan?.draftTestCasesCount ?? loadedDrafts.length;

  return {
    draftCount,
    draftTestCases,
    isBlocked: testPlan?.launchBlocked ?? draftCount > 0,
  };
};
