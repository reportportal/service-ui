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

import { AxiosRequestConfig } from 'axios';
import { Page } from 'types/common';
import { Lifecycle } from 'types/aiFactory';
import { TestCase } from 'types/testCase';
import { findCase } from './db';

export interface LibraryFilters {
  lifecycle?: Lifecycle;
  ai?: boolean;
  iterationId?: number;
}

interface TestCaseListResponse {
  content: TestCase[];
  page?: Page;
}

type LibraryTestCase = Pick<TestCase, 'displayId'>;

const LIFECYCLE_PARAM = 'filter.eq.lifecycle';
const AI_PARAM = 'filter.eq.ai';
const ITERATION_PARAM = 'filter.eq.iterationId';
const COUNT_REQUEST_PARAMS = new Set([LIFECYCLE_PARAM, AI_PARAM, 'limit', 'offset']);

const toParamsRecord = (params: unknown): Record<string, unknown> =>
  typeof params === 'object' && params !== null && !Array.isArray(params)
    ? (params as Record<string, unknown>)
    : {};

const paramsFromUrl = (url?: string): URLSearchParams => {
  const query = url?.split('?')[1] ?? '';
  return new URLSearchParams(query);
};

const readParam = (config: AxiosRequestConfig, key: string): unknown => {
  const configValue = toParamsRecord(config.params)[key];
  return configValue ?? paramsFromUrl(config.url).get(key) ?? undefined;
};

const parseLifecycle = (value: unknown): Lifecycle | undefined =>
  value === Lifecycle.DRAFT || value === Lifecycle.READY ? value : undefined;

const parseAi = (value: unknown): boolean | undefined => {
  if (value === true || value === 'true' || value === 'AI') return true;
  if (value === false || value === 'false' || value === 'NO_AI') return false;
  return undefined;
};

const parseIterationId = (value: unknown): number | undefined => {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
};

export const parseLibraryFilters = (config: AxiosRequestConfig): LibraryFilters => ({
  lifecycle: parseLifecycle(readParam(config, LIFECYCLE_PARAM)),
  ai: parseAi(readParam(config, AI_PARAM)),
  iterationId: parseIterationId(readParam(config, ITERATION_PARAM)),
});

export const hasLibraryFilters = (filters: LibraryFilters): boolean =>
  filters.lifecycle !== undefined || filters.ai !== undefined || filters.iterationId !== undefined;

export const matchesLibraryFilters = (
  testCase: LibraryTestCase,
  filters: LibraryFilters,
): boolean => {
  const record = findCase(testCase.displayId);
  if (filters.lifecycle !== undefined && record?.lifecycle !== filters.lifecycle) return false;
  if (filters.ai !== undefined && Boolean(record?.ai) !== filters.ai) return false;
  if (filters.iterationId !== undefined && record?.ai?.iterationId !== filters.iterationId) return false;
  return true;
};

export const countReviewQueueCases = (
  testCases: LibraryTestCase[],
  iterationId?: number,
): number =>
  testCases.filter((testCase) =>
    matchesLibraryFilters(testCase, {
      lifecycle: Lifecycle.DRAFT,
      ai: true,
      iterationId,
    }),
  ).length;

const isCompleteList = (data: TestCaseListResponse): data is Required<TestCaseListResponse> =>
  Boolean(data.page) && data.page?.totalPages <= 1 && data.page.totalElements === data.content.length;

const filteredPage = (page: Page, totalElements: number): Page => ({
  ...page,
  totalElements,
  totalPages: page.size > 0 ? Math.ceil(totalElements / page.size) : 0,
});

const activeRequestParamKeys = (config: AxiosRequestConfig): string[] => {
  const urlKeys = [...paramsFromUrl(config.url).keys()];
  const configKeys = Object.entries(toParamsRecord(config.params))
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key]) => key);
  return [...new Set([...urlKeys, ...configKeys])];
};

export const isReviewQueueCountRequest = (
  config: AxiosRequestConfig,
  filters: LibraryFilters,
): boolean =>
  config.method?.toLowerCase() === 'get' &&
  /\/tms\/test-case(?:\?|$)/.test(config.url ?? '') &&
  filters.lifecycle === Lifecycle.DRAFT &&
  filters.ai === true &&
  filters.iterationId === undefined &&
  Number(readParam(config, 'limit')) === 1 &&
  [undefined, 0, '0'].includes(readParam(config, 'offset') as number | string | undefined) &&
  activeRequestParamKeys(config).every((key) => COUNT_REQUEST_PARAMS.has(key));

export const applyReviewQueueCount = <T extends TestCaseListResponse>(
  data: T,
  totalElements: number,
): T => {
  if (!data.page) return data;
  return {
    ...data,
    page: {
      ...data.page,
      totalElements,
      totalPages: data.page.size > 0 ? Math.ceil(totalElements / data.page.size) : 0,
    },
  };
};

export const filterCompleteTestCaseList = <T extends TestCaseListResponse>(
  data: T,
  filters: LibraryFilters,
): T => {
  if (!hasLibraryFilters(filters) || !isCompleteList(data)) return data;
  const content = data.content.filter((testCase) => matchesLibraryFilters(testCase, filters));
  return { ...data, content, page: filteredPage(data.page, content.length) };
};
