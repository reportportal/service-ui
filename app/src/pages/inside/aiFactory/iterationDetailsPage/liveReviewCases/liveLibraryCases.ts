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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export interface LiveLibraryCase {
  id: number;
  displayId: string;
  name: string;
  status?: 'DRAFT' | 'READY';
  overallScore?: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const adaptLiveLibraryCase = (
  response: unknown,
  displayId: string,
): LiveLibraryCase | null => {
  const page = asRecord(response);
  const content = page?.content;
  if (!Array.isArray(content) || content.length !== 1) return null;
  const metadata = asRecord(page?.page);
  if (metadata?.totalElements !== undefined && metadata.totalElements !== 1) return null;
  const item = asRecord(content[0]);
  if (
    !item ||
    !Number.isSafeInteger(item.id) ||
    (item.id as number) <= 0 ||
    item.displayId !== displayId ||
    typeof item.name !== 'string' ||
    !item.name.trim()
  ) {
    return null;
  }
  const metrics = asRecord(item.metrics);
  const score = metrics?.overallScore;
  return {
    id: item.id as number,
    displayId,
    name: item.name,
    ...(item.status === 'DRAFT' || item.status === 'READY' ? { status: item.status } : {}),
    ...(typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
      ? { overallScore: score }
      : {}),
  };
};

export const getLiveLibraryCases = async (
  projectKey: string,
  displayIds: string[],
  signal: AbortSignal,
): Promise<Array<{ displayId: string; testCase: LiveLibraryCase | null }>> =>
  Promise.all(
    displayIds.map(async (displayId) => {
      try {
        const response = await fetch(
          URLS.testCases(projectKey, { 'filter.eq.displayId': displayId, offset: 0, limit: 2 }),
          { signal },
        );
        return { displayId, testCase: adaptLiveLibraryCase(response, displayId) };
      } catch {
        return { displayId, testCase: null };
      }
    }),
  );
