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

import { call, select, all, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_ERROR, FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { LOGOUT } from 'controllers/auth';
import {
  AiIterationStatus,
  AiStageStatus,
  ComparisonIteration,
  ComparisonMode,
  ComparisonRequirement,
  ComparisonStage,
  ComparisonStageEntry,
  CriterionKey,
  IterationPageRS,
  IterationRS,
  IterationStatus,
  LivePipelineStatus,
  PipelineCompareIterationRS,
  PipelineCompareRS,
  PipelineCompareStageDeltaEntryRS,
  PipelineCompareMockIterationMetricsRS,
  PipelineCompareMockStageMetricsRS,
  PipelineCompareStageRS,
  PipelineComparison,
  PipelineRS,
  StageKey,
  StageStatus,
} from 'types/aiFactory';

import {
  adaptLivePipelineIterationDetail,
  adaptLivePipelineIterations,
  adaptLivePipelines,
} from './liveAdapters';

import {
  CLEAR_PIPELINE_COMPARISON,
  GET_PIPELINE_COMPARISON,
  GET_PIPELINE_ITERATION_DETAILS,
  GET_PIPELINE_ITERATIONS,
  GET_PIPELINES,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINE_COMPARISON_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';
import {
  GetPipelineComparisonAction,
  GetPipelineIterationDetailsAction,
  GetPipelineIterationsAction,
  PipelinesState,
} from './types';
import {
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelinesStateSelector,
} from './selectors';
import {
  getPipelineCatalogTransport,
  getPipelineDetailTransport,
  isMockDownstreamCompatible,
  PipelineCatalogTransport,
  PipelineDetailTransport,
} from './transport';

let abortController: AbortController | undefined;
let pipelineCatalogRequestId = 0;
const iterationsAbortControllers = new Set<AbortController>();
let pipelineIterationsRequestId = 0;
let iterationDetailsAbortController: AbortController | undefined;
let iterationDetailsRequestId = 0;
let comparisonAbortController: AbortController | undefined;

interface PipelineDetailRequestMeta {
  namespace: typeof PIPELINE_ITERATION_DETAILS_NAMESPACE;
  requestId: number;
  projectKey: string;
  pipelineId: number;
  iterationId: number;
  catalogTransport: PipelineCatalogTransport;
  catalogVersion: number;
  catalogRequestId: number;
  detailTransport: PipelineDetailTransport;
}

const LIVE_ITERATION_STATUS: Record<LivePipelineStatus, AiIterationStatus> = {
  PENDING: IterationStatus.RUNNING,
  PASSED: IterationStatus.COMPLETED,
  FAILED: IterationStatus.FAILED,
  NEEDS_HUMAN: IterationStatus.IN_REVIEW,
};

const LIVE_STAGE_STATUS: Record<LivePipelineStatus, AiStageStatus> = {
  PENDING: StageStatus.PENDING,
  PASSED: StageStatus.PASSED,
  FAILED: StageStatus.FAILED,
  NEEDS_HUMAN: StageStatus.IN_PROGRESS,
};

const CRITERION_MAX: Record<CriterionKey, number> = {
  [CriterionKey.ATOMICITY]: 15,
  [CriterionKey.CLEAR_STEPS]: 20,
  [CriterionKey.EXPECTED_RESULTS]: 20,
  [CriterionKey.NO_INVENTED_LOGIC]: 20,
  [CriterionKey.NO_INVENTED_UI]: 15,
  [CriterionKey.COHERENCE]: 10,
};

const STAGE_ALIASES: Record<string, StageKey> = {
  CREATE: StageKey.CREATE,
  GRADE: StageKey.GRADE,
  UPLOAD: StageKey.UPLOAD,
  REVIEW: StageKey.REVIEW,
  PREPARE: StageKey.PREPARE,
  DEVELOP: StageKey.DEVELOP,
  AUTOMATION_REVIEW: StageKey.AUTOMATION_REVIEW,
  AUTOMATIONREVIEW: StageKey.AUTOMATION_REVIEW,
  FIX: StageKey.FIX,
};

const CANONICAL_STAGE_ORDER = [
  StageKey.CREATE,
  StageKey.GRADE,
  StageKey.UPLOAD,
  StageKey.REVIEW,
  StageKey.PREPARE,
  StageKey.DEVELOP,
  StageKey.AUTOMATION_REVIEW,
  StageKey.FIX,
];

const hasOwn = (value: object, key: PropertyKey): boolean =>
  Boolean(Object.prototype.hasOwnProperty.call(value, key));

const normalizeStatus = <T>(
  statuses: Record<LivePipelineStatus, T>,
  value?: string,
): T | 'UNKNOWN' =>
  typeof value === 'string' && hasOwn(statuses, value)
    ? statuses[value as LivePipelineStatus]
    : 'UNKNOWN';

const validNumber = (value: unknown, min: number, max = Number.POSITIVE_INFINITY) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? value
    : undefined;

const validCount = (value: unknown): number | undefined => {
  const count = validNumber(value, 0, Number.MAX_SAFE_INTEGER);
  return count !== undefined && Number.isSafeInteger(count) ? count : undefined;
};

const trimmedString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.trim() || undefined : undefined;

const normalizeRequirement = (value?: ComparisonRequirement): ComparisonRequirement | undefined => {
  const specId = trimmedString(value?.specId);
  if (!specId) {
    return undefined;
  }
  return {
    specId,
    title: trimmedString(value?.title),
    jiraKey: trimmedString(value?.jiraKey),
  };
};

const normalizeCriterionAverages = (
  values?: Record<CriterionKey, number>,
): Record<CriterionKey, number> | undefined => {
  if (!values) return undefined;
  const entries = Object.values(CriterionKey).map(
    (key) =>
      [
        key,
        hasOwn(values, key) ? validNumber(values[key], 0, CRITERION_MAX[key]) : undefined,
      ] as const,
  );
  return entries.some(([, value]) => value === undefined)
    ? undefined
    : (Object.fromEntries(entries) as Record<CriterionKey, number>);
};

const normalizeRichIteration = (
  metrics?: PipelineCompareMockIterationMetricsRS,
): Partial<ComparisonIteration> => {
  const testCasesCount = validCount(metrics?.testCasesCount);
  const readyCount = validCount(metrics?.readyCount);
  const autoReadyPromotedCount = validCount(metrics?.autoReadyPromotedCount);
  return {
    requirement: normalizeRequirement(metrics?.requirement),
    testCasesCount,
    suiteScore: validNumber(metrics?.suiteScore, 0, 100),
    readyCount:
      readyCount !== undefined && (testCasesCount === undefined || readyCount <= testCasesCount)
        ? readyCount
        : undefined,
    fixRoundsCount: validCount(metrics?.fixRoundsCount),
    autoReadyPromotedCount:
      autoReadyPromotedCount !== undefined &&
      (testCasesCount === undefined || autoReadyPromotedCount <= testCasesCount)
        ? autoReadyPromotedCount
        : undefined,
    criterionAverages: normalizeCriterionAverages(metrics?.criterionAverages),
    costTotal: validNumber(metrics?.costTotal, 0),
    durationMs: validNumber(metrics?.durationMs, 0),
  };
};

const normalizeIteration = (
  raw: PipelineCompareIterationRS,
  mode: ComparisonMode,
): ComparisonIteration => ({
  id: raw.id,
  number: raw.iterationNumber,
  status: normalizeStatus(LIVE_ITERATION_STATUS, raw.status),
  ...(mode === 'mock-rich' ? normalizeRichIteration(raw.mockMetrics) : {}),
});

export const normalizeComparisonStageKey = (value?: string): string | undefined => {
  const key = trimmedString(value);
  if (!key) return undefined;
  const alias = key.replace(/[\s-]+/g, '_').toUpperCase();
  return hasOwn(STAGE_ALIASES, alias) ? STAGE_ALIASES[alias] : key;
};

type RawStageEntry = PipelineCompareStageRS | PipelineCompareStageDeltaEntryRS;

const normalizeStageMetric = (value: unknown, key?: string): number | undefined => {
  if (key === 'GRADE') return validNumber(value, 0, 100);
  const isKnownStage = Object.values(StageKey).some((stageKey) => String(stageKey) === key);
  return isKnownStage ? validCount(value) : validNumber(value, 0);
};

const normalizeStageMetrics = (
  metrics?: PipelineCompareMockStageMetricsRS,
  key?: string,
): Omit<ComparisonStageEntry, 'status'> => ({
  metric: normalizeStageMetric(metrics?.metric, key),
  cost: validNumber(metrics?.cost, 0),
  durationMs: validNumber(metrics?.durationMs, 0),
});

const normalizeStageEntry = (
  raw: RawStageEntry | undefined,
  mode: ComparisonMode,
  key: string,
): ComparisonStageEntry | undefined =>
  raw
    ? {
        status: normalizeStatus(LIVE_STAGE_STATUS, raw.status),
        ...(mode === 'mock-rich' ? normalizeStageMetrics(raw.mockMetrics, key) : {}),
      }
    : undefined;

const assertIterationIdentity = (
  raw: PipelineCompareIterationRS | undefined,
  expectedIterationId: number,
  expectedPipelineId: number,
): PipelineCompareIterationRS => {
  if (
    !Number.isSafeInteger(expectedIterationId) ||
    expectedIterationId <= 0 ||
    !Number.isSafeInteger(expectedPipelineId) ||
    expectedPipelineId <= 0 ||
    raw?.id !== expectedIterationId ||
    raw.pipelineId !== expectedPipelineId ||
    !Number.isSafeInteger(raw.iterationNumber) ||
    (raw.iterationNumber ?? 0) <= 0
  ) {
    throw new Error('Pipeline comparison identity mismatch');
  }
  return raw;
};

interface OrderedStageMap<T> {
  entries: Map<string, T>;
  order: string[];
}

const addStageEntry = <T extends { stageKey?: string }>(
  result: OrderedStageMap<T>,
  entry: T,
): void => {
  const key = normalizeComparisonStageKey(entry.stageKey);
  if (!key) {
    return;
  }
  if (result.entries.has(key)) {
    throw new Error('Pipeline comparison contains duplicate stage keys');
  }
  result.entries.set(key, entry);
  result.order.push(key);
};

const stageMap = <T extends { stageKey?: string }>(items: T[] = []): OrderedStageMap<T> => {
  const result: OrderedStageMap<T> = { entries: new Map(), order: [] };
  items.forEach((entry) => addStageEntry(result, entry));
  return result;
};

const mergeStageOrder = (...orders: string[][]): string[] => {
  const keys = new Set<string>();
  orders.flat().forEach((key) => keys.add(key));
  return [...keys];
};

const resolveStageSequence = (
  candidate?: PipelineCompareStageRS,
  baseline?: PipelineCompareStageRS,
): number | undefined => {
  const candidateSequence = validCount(candidate?.sequence);
  const baselineSequence = validCount(baseline?.sequence);
  if (
    candidateSequence !== undefined &&
    baselineSequence !== undefined &&
    candidateSequence !== baselineSequence
  ) {
    return undefined;
  }
  return candidateSequence ?? baselineSequence;
};

const fallbackStageOrder = (key: string): number => {
  const index = CANONICAL_STAGE_ORDER.findIndex((stageKey) => String(stageKey) === key);
  return index === -1 ? Number.POSITIVE_INFINITY : index;
};

const compareStages = (
  mode: ComparisonMode,
  left: ComparisonStage & { sourceIndex: number },
  right: ComparisonStage & { sourceIndex: number },
): number => {
  if (left.sequence !== undefined && right.sequence !== undefined) {
    return left.sequence - right.sequence || left.sourceIndex - right.sourceIndex;
  }
  if (left.sequence !== undefined) return -1;
  if (right.sequence !== undefined) return 1;
  if (mode === 'status-only') return left.sourceIndex - right.sourceIndex;
  const canonicalDifference = fallbackStageOrder(left.key) - fallbackStageOrder(right.key);
  return canonicalDifference || left.sourceIndex - right.sourceIndex;
};

const normalizeStages = (
  raw: PipelineCompareRS,
  candidate: PipelineCompareIterationRS,
  baseline: PipelineCompareIterationRS,
  mode: ComparisonMode,
): ComparisonStage[] => {
  const candidateStages = stageMap(candidate.stages);
  const baselineStages = stageMap(baseline.stages);
  const deltas = stageMap(raw.stageDeltas);
  const keys = mergeStageOrder(deltas.order, candidateStages.order, baselineStages.order);
  return keys
    .map((key, sourceIndex) => ({
      key,
      sourceIndex,
      sequence: resolveStageSequence(
        candidateStages.entries.get(key),
        baselineStages.entries.get(key),
      ),
      candidate: normalizeStageEntry(
        deltas.entries.get(key)?.current ?? candidateStages.entries.get(key),
        mode,
        key,
      ),
      baseline: normalizeStageEntry(
        deltas.entries.get(key)?.previous ?? baselineStages.entries.get(key),
        mode,
        key,
      ),
    }))
    .sort((left, right) => compareStages(mode, left, right))
    .map(({ sourceIndex: _sourceIndex, ...stage }) => stage);
};

const getComparisonMode = (raw: PipelineCompareRS): ComparisonMode =>
  typeof raw.mock === 'object' &&
  raw.mock !== null &&
  hasOwn(raw.mock, 'kind') &&
  hasOwn(raw.mock, 'version') &&
  raw.mock.kind === 'REPORTPORTAL_AI_FACTORY_COMPARE_DEMO' &&
  raw.mock.version === 1
    ? 'mock-rich'
    : 'status-only';

export const normalizePipelineComparison = (
  raw: PipelineCompareRS,
  pipelineId: number,
  candidateIterationId: number,
  baselineIterationId: number,
): PipelineComparison => {
  if (candidateIterationId === baselineIterationId) {
    throw new Error('Pipeline comparison requires two different iterations');
  }
  const mode = getComparisonMode(raw);
  const candidate = assertIterationIdentity(raw.current, candidateIterationId, pipelineId);
  const baseline = assertIterationIdentity(raw.previous, baselineIterationId, pipelineId);
  const normalizedCandidate = normalizeIteration(candidate, mode);
  const normalizedBaseline = normalizeIteration(baseline, mode);
  return {
    mode,
    pipelineId,
    candidate: normalizedCandidate,
    baseline: normalizedBaseline,
    hasDifferentRequirements:
      mode === 'mock-rich' &&
      Boolean(normalizedCandidate.requirement && normalizedBaseline.requirement) &&
      normalizedCandidate.requirement?.specId !== normalizedBaseline.requirement?.specId,
    stages: normalizeStages(raw, candidate, baseline, mode),
  };
};

function* getPipelines(): Generator {
  const controller = new AbortController();
  abortController?.abort();
  iterationsAbortControllers.forEach((iterationsController) => iterationsController.abort());
  iterationsAbortControllers.clear();
  iterationDetailsAbortController?.abort();
  comparisonAbortController?.abort();
  abortController = controller;
  pipelineCatalogRequestId += 1;
  const catalogRequestId = pipelineCatalogRequestId;
  let projectKey = '';

  try {
    projectKey = (yield select(projectKeySelector)) as string;
    const transport = getPipelineCatalogTransport();
    const meta = {
      namespace: PIPELINES_NAMESPACE,
      catalogRequestId,
      projectKey,
      transport: transport.mode,
      transportFallback: transport.isFallback,
    };

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta,
    });

    const rawData = (yield call(
      fetch,
      transport.mode === 'live' ? URLS.pipelineCatalog(projectKey) : URLS.tmsPipeline(projectKey),
      { signal: controller.signal },
    )) as unknown;
    const data =
      transport.mode === 'live' ? adaptLivePipelines(rawData) : (rawData as PipelineRS[]);

    yield put({
      type: FETCH_SUCCESS,
      payload: { data },
      meta,
    });
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    const meta = { namespace: PIPELINES_NAMESPACE, catalogRequestId, projectKey };
    yield put({ type: FETCH_ERROR, payload: error, error: true, meta });
    const state = (yield select(pipelinesStateSelector)) as PipelinesState;
    const isCurrentRequest =
      state.catalogRequestId === catalogRequestId && state.catalogProjectKey === projectKey;

    if (!isCancellation && isCurrentRequest) {
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  }
}

function handleLogoutDuringPipelinesFetch(): void {
  const controller = abortController;
  abortController = undefined;
  controller?.abort();
}

function* watchGetPipelines() {
  yield takeLatest(GET_PIPELINES, getPipelines);
  yield takeEvery(LOGOUT, handleLogoutDuringPipelinesFetch);
}

interface PipelineIterationsRequest {
  projectKey: string;
  pipelineId: number;
  transport: PipelineCatalogTransport;
  catalogVersion: number;
  requestId: number;
  signal: AbortSignal;
}

interface PipelineIterationsResult {
  pipelineId: number;
  hasError: boolean;
}

function* fetchPipelineIterations({
  projectKey,
  pipelineId,
  transport,
  catalogVersion,
  requestId,
  signal,
}: PipelineIterationsRequest): Generator {
  const meta = {
    namespace: PIPELINE_ITERATIONS_NAMESPACE,
    pipelineId,
    transport,
    catalogVersion,
    requestId,
  };
  yield put({ type: FETCH_START, payload: { projectKey }, meta });

  try {
    const rawData = (yield call(
      fetch,
      transport === 'live'
        ? URLS.pipelineCatalogIterations(projectKey, pipelineId)
        : URLS.tmsPipelineIterations(projectKey, pipelineId),
      { signal },
    )) as unknown;
    const data =
      transport === 'live'
        ? adaptLivePipelineIterations(rawData, pipelineId)
        : (rawData as IterationPageRS).content;
    yield put({ type: FETCH_SUCCESS, payload: { data }, meta });
    return { pipelineId, hasError: false };
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    yield put({
      type: FETCH_ERROR,
      payload: error,
      error: true,
      meta: { ...meta, isCancellation },
    });
    return { pipelineId, hasError: !isCancellation };
  }
}

function* getPipelineIterations(action: GetPipelineIterationsAction): Generator {
  const controller = new AbortController();
  iterationsAbortControllers.add(controller);
  pipelineIterationsRequestId += 1;
  const requestId = pipelineIterationsRequestId;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const transport = (yield select(pipelineCatalogTransportSelector)) as PipelineCatalogTransport;
    const catalogVersion = (yield select(pipelineCatalogVersionSelector)) as number;
    const pipelineIds = Array.from(
      new Set(
        action.payload.pipelineIds.filter(
          (pipelineId) => Number.isSafeInteger(pipelineId) && pipelineId > 0,
        ),
      ),
    );
    const results = (yield all(
      pipelineIds.map((pipelineId) =>
        call(fetchPipelineIterations, {
          projectKey,
          pipelineId,
          transport,
          catalogVersion,
          requestId,
          signal: controller.signal,
        }),
      ),
    )) as PipelineIterationsResult[];

    const state = (yield select(pipelinesStateSelector)) as PipelinesState;
    const hasCurrentFailure = results.some(
      ({ pipelineId, hasError }) =>
        hasError &&
        state.catalogVersion === catalogVersion &&
        state.transport === transport &&
        state.iterationRequestIdByPipeline[pipelineId] === requestId,
    );
    if (hasCurrentFailure) {
      yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
    }
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';

    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINE_ITERATIONS_NAMESPACE, error));
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  } finally {
    iterationsAbortControllers.delete(controller);
  }
}

function handleLogoutDuringIterationsFetch(): void {
  iterationsAbortControllers.forEach((controller) => controller.abort());
  iterationsAbortControllers.clear();
}

function* watchGetPipelineIterations() {
  yield takeEvery(GET_PIPELINE_ITERATIONS, getPipelineIterations);
  yield takeEvery(LOGOUT, handleLogoutDuringIterationsFetch);
}

const isPositiveIdentity = (value: number): boolean => Number.isSafeInteger(value) && value > 0;

function* createPipelineDetailMeta(
  action: GetPipelineIterationDetailsAction,
): Generator<unknown, PipelineDetailRequestMeta | undefined> {
  const projectKey = (yield select(projectKeySelector)) as string;
  const catalogTransport = (yield select(
    pipelineCatalogTransportSelector,
  )) as PipelineCatalogTransport;
  const catalogVersion = (yield select(pipelineCatalogVersionSelector)) as number;
  const catalogRequestId = (yield select(pipelineCatalogRequestIdSelector)) as number | null;
  const catalogProjectKey = (yield select(pipelineCatalogProjectKeySelector)) as string | null;
  const { pipelineId, iterationId } = action.payload;
  if (
    catalogVersion <= 0 ||
    catalogRequestId === null ||
    catalogProjectKey !== projectKey ||
    !isPositiveIdentity(pipelineId) ||
    !isPositiveIdentity(iterationId)
  ) {
    return undefined;
  }
  iterationDetailsRequestId += 1;
  return {
    namespace: PIPELINE_ITERATION_DETAILS_NAMESPACE,
    requestId: iterationDetailsRequestId,
    projectKey,
    pipelineId,
    iterationId,
    catalogTransport,
    catalogVersion,
    catalogRequestId,
    detailTransport: getPipelineDetailTransport(catalogTransport),
  };
}

function* fetchPipelineIterationDetail(
  meta: PipelineDetailRequestMeta,
  signal: AbortSignal,
): Generator<unknown, IterationRS | ReturnType<typeof adaptLivePipelineIterationDetail>> {
  const rawData = (yield call(
    fetch,
    meta.detailTransport === 'live'
      ? URLS.pipelineIterationById(meta.projectKey, meta.iterationId)
      : URLS.tmsPipelineIterationById(meta.projectKey, meta.pipelineId, meta.iterationId),
    { signal },
  )) as unknown;
  return meta.detailTransport === 'live'
    ? adaptLivePipelineIterationDetail(rawData, meta.pipelineId, meta.iterationId)
    : (rawData as IterationRS);
}

function* handlePipelineDetailFailure(
  error: unknown,
  requestMeta: PipelineDetailRequestMeta,
): Generator {
  const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
  yield put({
    type: FETCH_ERROR,
    payload: error,
    error: true,
    meta: { ...requestMeta, isCancellation },
  });
  const state = (yield select(pipelinesStateSelector)) as PipelinesState;
  const isCurrentRequest =
    state.detailRequestId === requestMeta.requestId &&
    state.detailProjectKey === requestMeta.projectKey &&
    state.detailCatalogVersion === requestMeta.catalogVersion &&
    state.detailCatalogRequestId === requestMeta.catalogRequestId;
  if (!isCancellation && isCurrentRequest) {
    yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
  }
}

function* getPipelineIterationDetails(action: GetPipelineIterationDetailsAction): Generator {
  const requestMeta = (yield call(createPipelineDetailMeta, action)) as
    | PipelineDetailRequestMeta
    | undefined;
  if (!requestMeta) return;

  const controller = new AbortController();
  iterationDetailsAbortController?.abort();
  iterationDetailsAbortController = controller;

  try {
    yield put({
      type: FETCH_START,
      payload: { projectKey: requestMeta.projectKey },
      meta: requestMeta,
    });

    if (requestMeta.detailTransport === 'unavailable') {
      yield put({
        type: FETCH_ERROR,
        payload: new Error('Pipeline iteration detail transport is unavailable'),
        error: true,
        meta: { ...requestMeta, isUnavailable: true },
      });
      return;
    }
    const data = (yield call(fetchPipelineIterationDetail, requestMeta, controller.signal)) as
      | IterationRS
      | ReturnType<typeof adaptLivePipelineIterationDetail>;
    yield put({ type: FETCH_SUCCESS, payload: { data }, meta: requestMeta });
  } catch (error) {
    yield call(handlePipelineDetailFailure, error, requestMeta);
  } finally {
    if (iterationDetailsAbortController === controller) {
      iterationDetailsAbortController = undefined;
    }
  }
}

function handleLogoutDuringIterationDetailsFetch(): void {
  const controller = iterationDetailsAbortController;
  iterationDetailsAbortController = undefined;
  controller?.abort();
}

function* watchGetPipelineIterationDetails() {
  yield takeEvery(GET_PIPELINE_ITERATION_DETAILS, getPipelineIterationDetails);
  yield takeEvery(LOGOUT, handleLogoutDuringIterationDetailsFetch);
}

function* getPipelineComparison(action: GetPipelineComparisonAction): Generator {
  const controller = new AbortController();
  comparisonAbortController?.abort();
  comparisonAbortController = controller;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const transport = (yield select(pipelineCatalogTransportSelector)) as PipelineCatalogTransport;
    const { pipelineId, candidateIterationId, baselineIterationId } = action.payload;
    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: PIPELINE_COMPARISON_NAMESPACE },
    });
    if (!isMockDownstreamCompatible(transport)) {
      throw new Error('Pipeline comparison transport is unavailable');
    }

    const raw = (yield call(
      fetch,
      URLS.pipelineIterationComparison(projectKey, candidateIterationId, baselineIterationId),
      { signal: controller.signal },
    )) as PipelineCompareRS;
    const data = normalizePipelineComparison(
      raw,
      pipelineId,
      candidateIterationId,
      baselineIterationId,
    );
    yield put(fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data }));
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';
    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINE_COMPARISON_NAMESPACE, error));
      yield put(showErrorNotification({ messageId: 'aiFactoryPipelinesLoadingFailed' }));
    }
  }
}

function clearPipelineComparison(): void {
  const controller = comparisonAbortController;
  comparisonAbortController = undefined;
  controller?.abort();
}

function* watchGetPipelineComparison() {
  yield takeLatest(GET_PIPELINE_COMPARISON, getPipelineComparison);
  yield takeEvery(CLEAR_PIPELINE_COMPARISON, clearPipelineComparison);
  yield takeEvery(LOGOUT, clearPipelineComparison);
}

export function* aiFactoryPipelinesSagas() {
  yield all([
    watchGetPipelines(),
    watchGetPipelineIterations(),
    watchGetPipelineIterationDetails(),
    watchGetPipelineComparison(),
  ]);
}
