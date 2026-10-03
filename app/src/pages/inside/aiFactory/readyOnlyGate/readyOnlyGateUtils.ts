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

export interface ReadyOnlySelection {
  eligibleIds: number[];
  skippedDrafts: TestCase[];
}

export const isDraftGateActive = (
  isAiFactoryEnabled: boolean,
  lifecycle?: AiLifecycle,
): boolean => isAiFactoryEnabled && lifecycle === Lifecycle.DRAFT;

export const partitionReadyOnlySelection = (
  selectedIds: number[],
  testCases: TestCase[],
  isAiFactoryEnabled: boolean,
): ReadyOnlySelection => {
  if (!isAiFactoryEnabled) {
    return { eligibleIds: selectedIds, skippedDrafts: [] };
  }

  const testCasesById = new Map(testCases.map((testCase) => [testCase.id, testCase]));
  const skippedDrafts: TestCase[] = [];
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

export const formatSkippedDrafts = (testCases: TestCase[]): string =>
  testCases.map(({ displayId, name }) => `${displayId} — ${name}`).join(', ');
