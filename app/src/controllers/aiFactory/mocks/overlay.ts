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

/**
 * Mode A ("Overlay") of docs/ai-factory-poc/03-frontend-architecture.md §4.2: merges the mock
 * AI/lifecycle fields (C1 in 05-backend-contract.md) into real TMS test-case responses, by
 * `displayId`, instead of mocking `tms/test-case` itself.
 *
 * **Scope of this file today:** the merge function and its unit test are real and used by
 * `index.ts`. Actually *seeding* AI cases into a real project (creating them via
 * `tms/test-case/batch` and registering them in the mock db) is not wired up yet — it writes to
 * a shared dev backend, and the target project/folder is still an open question (Q-ORG-07 in
 * docs/ai-factory-poc/06-open-questions.md). Until it is answered, the overlay only enriches
 * responses for cases whose `displayId` already exists in the mock db (the seed's TC101…TC108 —
 * present only once someone creates cases with those names in the target project).
 */

import {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Page } from 'types/common';
import { Lifecycle, ScenarioUpdateRS, TestCaseAiExtension } from 'types/aiFactory';
import { TestCase, TestCaseManualScenario } from 'types/testCase';
import {
  findCase,
  findIteration,
  findPipeline,
  getDb,
  plansBlockedByCase,
  recordScenarioChange,
  registerCaseAlias,
} from './db';
import {
  applyReviewQueueCount,
  countReviewQueueCases,
  filterCompleteTestCaseList,
  isReviewQueueCountRequest,
  matchesLibraryFilters,
  parseLibraryFilters,
} from './libraryFilters';
import { toTestCaseAiExtension } from './viewModels';

type ScenarioFields = {
  manualScenarioType: TestCaseManualScenario;
  precondition: string;
  steps: { instructions: string; expectedResult: string }[];
  instructions: string;
  expectedResult: string;
};

type ScenarioUpdatePayload = {
  manualScenario?: unknown;
  promoteToReady?: boolean;
};

interface FilterRequestContext {
  filters: ReturnType<typeof parseLibraryFilters>;
  headers?: AxiosRequestConfig['headers'];
  isCountProbe: boolean;
  limit?: number;
  offset: number;
  signal?: AxiosRequestConfig['signal'];
  url: string;
}

type FilterRequestConfig = InternalAxiosRequestConfig & {
  aiFactoryFilterContext?: FilterRequestContext;
};

interface PagedTestCaseList {
  content: TestCase[];
  page: Page;
}

interface TestPlanDetails {
  id: number;
  name: string;
  draftTestCasesCount?: number;
  draftTestCases?: { id: number; displayId: string }[];
  launchBlocked?: boolean;
}

const FETCH_PAGE_SIZE = 1000;
const MAX_FILTER_RECORDS = 5000;
const C3_FILTER_KEYS = [
  'filter.eq.lifecycle',
  'filter.eq.ai',
  'filter.eq.iterationId',
];

export const C3_OVERLAY_ERROR_CODE = 'AI_FACTORY_C3_OVERLAY_FAILED';

export class C3OverlayError extends Error {
  readonly code = C3_OVERLAY_ERROR_CODE;

  constructor(message: string) {
    super(message);
    this.name = 'C3OverlayError';
  }
}

export const mergeAiFields = (testCase: TestCase): TestCase & Partial<TestCaseAiExtension> => {
  const record = findCase(testCase.displayId);
  if (!record) {
    return testCase; // no matching mock record — the toggle-OFF/no-data guard in components handles this too
  }
  const reviewStepIds = testCase.manualScenario?.steps
    ?.map(({ id }) => id)
    .filter((id): id is number => Number.isSafeInteger(id));
  registerCaseAlias(testCase.id, record, reviewStepIds);
  const iteration = record.ai ? findIteration(record.ai.iterationId) : undefined;
  const pipeline = iteration ? findPipeline(iteration.pipelineId) : undefined;
  return {
    ...testCase,
    ...toTestCaseAiExtension(record, pipeline, iteration),
    blockedPlans: plansBlockedByCase(record.id).map((p) => ({ id: p.id, name: p.name })),
  };
};

export const mergeTestPlanAiFields = (testPlan: TestPlanDetails): TestPlanDetails => {
  const plan = getDb().plans.find(({ name }) => name === testPlan.name);
  if (!plan) {
    return testPlan;
  }
  const draftTestCases = plan.testCaseIds
    .map((testCaseId) => findCase(testCaseId))
    .filter((testCase) => testCase?.lifecycle === Lifecycle.DRAFT)
    .map(({ id, displayId }) => ({ id, displayId }));

  return {
    ...testPlan,
    draftTestCasesCount: draftTestCases.length,
    draftTestCases,
    launchBlocked: draftTestCases.length > 0,
  };
};

const isTestCaseList = (data: unknown): data is { content: TestCase[] } =>
  Boolean(data) && Array.isArray((data as { content?: unknown }).content);

const isPagedTestCaseList = (data: unknown): data is PagedTestCaseList =>
  isTestCaseList(data) && Boolean((data as { page?: unknown }).page);

const isTestCase = (data: unknown): data is TestCase =>
  Boolean(data) && typeof (data as TestCase).displayId === 'string';

const isTestPlanDetails = (data: unknown): data is TestPlanDetails =>
  Boolean(data) &&
  typeof (data as TestPlanDetails).id === 'number' &&
  typeof (data as TestPlanDetails).name === 'string';

const isTestPlanDetailsUrl = (url?: string): boolean =>
  /\/tms\/test-plan\/[^/?]+(?:\?|$)/.test(url ?? '');

const isTestCaseResponseUrl = (url?: string): boolean =>
  /\/tms\/(?:test-case|test-plan\/[^/]+\/test-case)(?:\/|\?|$)/.test(url ?? '');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasInvalidText = (value: unknown): boolean => value != null && typeof value !== 'string';

const numericParam = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  }
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const mergedRequestParams = (config: AxiosRequestConfig): URLSearchParams => {
  const [, query = ''] = (config.url ?? '').split('?');
  const params = new URLSearchParams(query);
  if (isRecord(config.params)) {
    Object.entries(config.params).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        params.set(key, String(value));
      }
    });
  }
  return params;
};

const toCanonicalUrl = (config: AxiosRequestConfig, fetchCompleteDataset: boolean): string => {
  const [path] = (config.url ?? '').split('?');
  const params = mergedRequestParams(config);
  C3_FILTER_KEYS.forEach((key) => params.delete(key));
  if (fetchCompleteDataset) {
    params.set('offset', '0');
    params.set('limit', String(FETCH_PAGE_SIZE));
  }
  return `${path}?${params.toString()}`;
};

const prepareFilterRequest = (config: FilterRequestConfig): FilterRequestConfig => {
  const filters = parseLibraryFilters(config);
  if (!isTestCaseListUrl(config.url) || !hasLibraryFilters(filters)) return config;
  const isCountProbe = isReviewQueueCountRequest(config, filters);
  const params = mergedRequestParams(config);
  const rawLimit = params.get('limit');
  const rawOffset = params.get('offset');
  const limit = numericParam(rawLimit);
  const offset = numericParam(params.get('offset')) ?? 0;
  if ((rawLimit !== null && (!limit || limit > FETCH_PAGE_SIZE)) ||
      (rawOffset !== null && (numericParam(rawOffset) === undefined || offset > MAX_FILTER_RECORDS))) {
    throw new C3OverlayError('AI Factory mock received unsafe pagination parameters');
  }
  const url = toCanonicalUrl(config, !isCountProbe);
  return {
    ...config,
    url,
    params: undefined,
    aiFactoryFilterContext: {
      filters,
      headers: config.headers,
      isCountProbe,
      limit,
      offset,
      signal: config.signal,
      url,
    },
  };
};

const isTestCaseListUrl = (url?: string): boolean =>
  /\/tms\/test-case(?:\?|$)/.test(url ?? '');

const hasLibraryFilters = (filters: ReturnType<typeof parseLibraryFilters>): boolean =>
  filters.lifecycle !== undefined || filters.ai !== undefined || filters.iterationId !== undefined;

const isScenarioStep = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && !hasInvalidText(value.instructions) && !hasInvalidText(value.expectedResult);

const toScenarioSteps = (value: unknown): ScenarioFields['steps'] | undefined => {
  if (!Array.isArray(value) || !value.every(isScenarioStep)) {
    return undefined;
  }
  return value.map((step) => ({
    instructions: (step.instructions as string | undefined) ?? '',
    expectedResult: (step.expectedResult as string | undefined) ?? '',
  }));
};

const toScenarioFields = (value: unknown): ScenarioFields | undefined => {
  if (!isRecord(value)) return undefined;
  const type = value.manualScenarioType;
  const isText = type === TestCaseManualScenario.TEXT;
  if (!isText && type !== TestCaseManualScenario.STEPS) return undefined;
  if (value.preconditions != null && !isRecord(value.preconditions)) return undefined;
  const precondition = isRecord(value.preconditions) ? value.preconditions.value : undefined;
  const steps = toScenarioSteps(value.steps ?? []);
  if (!steps || [precondition, value.instructions, value.expectedResult].some(hasInvalidText)) {
    return undefined;
  }
  return {
    manualScenarioType: type,
    precondition: (precondition as string | undefined) ?? '',
    steps,
    instructions: (value.instructions as string | undefined) ?? '',
    expectedResult: (value.expectedResult as string | undefined) ?? '',
  };
};

const parsePayload = (data: unknown): ScenarioUpdatePayload => {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return isRecord(parsed)
      ? {
          manualScenario: parsed.manualScenario,
          promoteToReady: parsed.promoteToReady === true,
        }
      : {};
  } catch {
    return {};
  }
};

const isScenarioChanged = (before?: ScenarioFields, after?: ScenarioFields): boolean =>
  Boolean(before && after && JSON.stringify(before) !== JSON.stringify(after));

const testCaseKeyFromUrl = (response: AxiosResponse): string | undefined =>
  response.config.url?.match(/\/tms\/test-case\/([^/?]+)(?:\?|$)/)?.[1];

const decodeCaseKey = (key?: string): string | undefined => {
  try {
    return key === undefined ? undefined : decodeURIComponent(key);
  } catch {
    return undefined;
  }
};

const rememberScenario = (scenarios: Map<string, ScenarioFields>, testCase: TestCase): void => {
  const scenario = toScenarioFields(testCase.manualScenario);
  if (!scenario) {
    return;
  }
  scenarios.set(String(testCase.id), scenario);
  scenarios.set(testCase.displayId, scenario);
};

const mergeUpdatedTestCase = (
  response: AxiosResponse,
  testCase: TestCase,
  scenarios: Map<string, ScenarioFields>,
): AxiosResponse => {
  const isUpdate = response.config.method?.toLowerCase() === 'put';
  const key = decodeCaseKey(testCaseKeyFromUrl(response));
  const before = key ? scenarios.get(key) : undefined;
  const payload = parsePayload(response.config.data);
  const after = toScenarioFields(payload.manualScenario);
  const record = findCase(testCase.displayId);
  const lifecycleChanged: ScenarioUpdateRS['lifecycleChanged'] =
    isUpdate && record && isScenarioChanged(before, after)
      ? recordScenarioChange(record, payload.promoteToReady)
      : null;
  rememberScenario(scenarios, testCase);
  const data = mergeAiFields(testCase);
  return { ...response, data: isUpdate ? { ...data, lifecycleChanged } : data };
};

const pageUrl = (url: string, offset: number, limit: number): string => {
  const [path, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  params.set('offset', String(offset));
  params.set('limit', String(limit));
  return `${path}?${params.toString()}`;
};

const isValidPagination = (page: Page, contentLength: number): boolean =>
  Number.isSafeInteger(page.number) &&
  page.number >= 0 &&
  Number.isSafeInteger(page.size) &&
  page.size > 0 &&
  page.size <= FETCH_PAGE_SIZE &&
  Number.isSafeInteger(page.totalElements) &&
  page.totalElements >= 0 &&
  page.totalElements <= MAX_FILTER_RECORDS &&
  Number.isSafeInteger(page.totalPages) &&
  page.totalPages >= 0 &&
  contentLength <= page.size;

const validatePage = (data: PagedTestCaseList, expected?: Page): void => {
  if (!isValidPagination(data.page, data.content.length)) {
    throw new C3OverlayError('AI Factory mock received invalid pagination metadata');
  }
  if (expected && data.page.totalElements !== expected.totalElements) {
    throw new C3OverlayError('AI Factory mock received inconsistent pagination metadata');
  }
};

const throwIfAborted = (signal?: AxiosRequestConfig['signal']): void => {
  if (!signal?.aborted) return;
  const error = new Error('AI Factory mock filtering was aborted');
  error.name = 'AbortError';
  throw error;
};

/**
 * Walks the real TMS list by offset until `totalElements` items are collected.
 * Does not trust `totalPages` alone — some backends ignore a large `limit` and keep a
 * small page size while still advertising a multi-page total (or a single-page total
 * with a truncated first page). Cap at {@link MAX_FILTER_RECORDS}.
 */
const fetchRemainingContent = async (
  http: AxiosInstance,
  response: AxiosResponse<PagedTestCaseList>,
  context: FilterRequestContext,
): Promise<TestCase[]> => {
  const { page, content } = response.data;
  validatePage(response.data);
  throwIfAborted(context.signal);

  let collected = content;
  let nextOffset = content.length;
  const requestSize = page.size;

  while (collected.length < page.totalElements) {
    throwIfAborted(context.signal);
    const { data } = await http.get<PagedTestCaseList>(
      pageUrl(context.url, nextOffset, requestSize),
      { headers: context.headers, signal: context.signal },
    );
    throwIfAborted(context.signal);
    if (!isPagedTestCaseList(data)) {
      throw new C3OverlayError('AI Factory mock received invalid pagination metadata');
    }
    validatePage(data, page);
    if (data.content.length === 0) {
      break;
    }
    collected = collected.concat(data.content);
    nextOffset += data.content.length;
    if (collected.length > MAX_FILTER_RECORDS) {
      throw new C3OverlayError('AI Factory mock received invalid pagination metadata');
    }
  }

  return collected;
};

const filteredPageData = (
  content: TestCase[],
  page: Page,
  context: FilterRequestContext,
): PagedTestCaseList => {
  const filtered = content.filter((testCase) =>
    matchesLibraryFilters(testCase, context.filters),
  );
  const limit = context.limit ?? page.size;
  const pagedContent = filtered.slice(context.offset, context.offset + limit);
  return {
    content: pagedContent,
    page: {
      number: Math.floor(context.offset / limit) + 1,
      size: limit,
      totalElements: filtered.length,
      totalPages: limit > 0 ? Math.ceil(filtered.length / limit) : 0,
    },
  };
};

const filterOwnedDataset = async (
  http: AxiosInstance,
  response: AxiosResponse<PagedTestCaseList>,
  context: FilterRequestContext,
): Promise<AxiosResponse<PagedTestCaseList>> => {
  const content = await fetchRemainingContent(http, response, context);
  if (content.length !== response.data.page.totalElements) {
    throw new C3OverlayError('AI Factory mock could not load the complete Test Case dataset');
  }
  return { ...response, data: filteredPageData(content, response.data.page, context) };
};

/** Enriches Test Case and Test Plan responses with the provisional C1/G2 contract fields. */
export const installOverlayInterceptor = (http: AxiosInstance): number => {
  const scenarios = new Map<string, ScenarioFields>();

  http.interceptors.request.use((config) => prepareFilterRequest(config));

  return http.interceptors.response.use(async (response: AxiosResponse) => {
    if (isTestPlanDetailsUrl(response.config.url) && isTestPlanDetails(response.data)) {
      return { ...response, data: mergeTestPlanAiFields(response.data) };
    }
    if (!isTestCaseResponseUrl(response.config.url)) {
      return response;
    }
    if (isTestCaseList(response.data)) {
      response.data.content.forEach((testCase) => rememberScenario(scenarios, testCase));
      const filters = parseLibraryFilters(response.config);
      const context = (response.config as FilterRequestConfig).aiFactoryFilterContext;
      if (context) {
        if (context.isCountProbe) {
          const countedData = applyReviewQueueCount(
            response.data,
            countReviewQueueCases(getDb().cases),
          );
          return {
            ...response,
            data: { ...countedData, content: countedData.content.map(mergeAiFields) },
          };
        }
        if (!isPagedTestCaseList(response.data)) {
          throw new C3OverlayError(
            'AI Factory mock requires pagination metadata to filter Test Cases',
          );
        }
        const filteredResponse = await filterOwnedDataset(
          http,
          response as AxiosResponse<PagedTestCaseList>,
          context,
        );
        return {
          ...filteredResponse,
          data: {
            ...filteredResponse.data,
            content: filteredResponse.data.content.map(mergeAiFields),
          },
        };
      }
      const filteredData = isReviewQueueCountRequest(response.config, filters)
        ? applyReviewQueueCount(response.data, countReviewQueueCases(getDb().cases))
        : filterCompleteTestCaseList(response.data, filters);
      return {
        ...response,
        data: { ...filteredData, content: filteredData.content.map(mergeAiFields) },
      };
    }
    if (isTestCase(response.data)) {
      return mergeUpdatedTestCase(response, response.data, scenarios);
    }
    return response;
  });
};
