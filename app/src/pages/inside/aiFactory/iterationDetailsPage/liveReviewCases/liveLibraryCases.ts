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
  folderId?: number;
  status?: 'DRAFT' | 'READY';
  overallScore?: number;
}

export interface LiveLibraryCasesPage {
  cases: LiveLibraryCase[];
  totalElements: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const adaptLiveLibraryCase = (value: unknown): LiveLibraryCase | null => {
  const item = asRecord(value);
  if (
    !item ||
    typeof item.id !== 'number' ||
    !Number.isSafeInteger(item.id) ||
    item.id <= 0 ||
    typeof item.displayId !== 'string' ||
    !item.displayId.trim() ||
    typeof item.name !== 'string' ||
    !item.name.trim()
  ) {
    return null;
  }
  const metrics = asRecord(item.metrics);
  const score = metrics?.overallScore;
  const folderId = asRecord(item.testFolder)?.id;
  return {
    id: item.id,
    displayId: item.displayId,
    name: item.name,
    ...(typeof folderId === 'number' && Number.isSafeInteger(folderId) && folderId > 0
      ? { folderId }
      : {}),
    ...(item.status === 'DRAFT' || item.status === 'READY' ? { status: item.status } : {}),
    ...(typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100
      ? { overallScore: score }
      : {}),
  };
};

export const adaptLiveLibraryCases = (response: unknown): LiveLibraryCasesPage | null => {
  const page = asRecord(response);
  const content: unknown = page?.content;
  const totalElements = asRecord(page?.page)?.totalElements;
  if (
    !Array.isArray(content) ||
    typeof totalElements !== 'number' ||
    !Number.isSafeInteger(totalElements) ||
    totalElements < content.length
  ) {
    return null;
  }

  const cases = new Map<number, LiveLibraryCase>();
  for (const value of content) {
    const testCase = adaptLiveLibraryCase(value);
    if (!testCase || cases.has(testCase.id)) return null;
    cases.set(testCase.id, testCase);
  }
  return { cases: [...cases.values()], totalElements };
};

export const getLiveLibraryCases = async (
  projectKey: string,
  iterationId: number,
  offset: number,
  limit: number,
  signal: AbortSignal,
): Promise<LiveLibraryCasesPage> => {
  const response: unknown = await fetch(
    URLS.testCases(projectKey, { 'filter.eq.iterationId': iterationId, offset, limit }),
    { signal },
  );
  const page = adaptLiveLibraryCases(response);
  if (
    !page ||
    page.cases.length > limit ||
    (!page.cases.length && offset < page.totalElements)
  ) {
    throw new Error('Invalid Review case page');
  }
  return page;
};

export const getLiveLibraryCaseFolder = async (
  projectKey: string,
  displayId: string,
  signal: AbortSignal,
): Promise<number | undefined> => {
  const response = await fetch(
    URLS.testCases(projectKey, { 'filter.eq.displayId': displayId, offset: 0, limit: 2 }),
    { signal },
  );
  const page = adaptLiveLibraryCases(response);
  const testCase = page?.cases[0];

  return page?.totalElements === 1 && testCase?.displayId === displayId
    ? testCase.folderId
    : undefined;
};
