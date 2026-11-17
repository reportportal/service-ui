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

import type { StageTrace, StageTraceAttempt } from 'controllers/aiFactory/stageTrace';

export interface StageTracePageRoute {
  organizationSlug: string;
  projectSlug: string;
  pipelineId: number;
  iterationId: number;
  stageKey: string;
}
interface TraceProjectState {
  projectKey?: string;
  activeProjectKey?: string;
  loading: boolean;
  organizationSlug?: string;
  projectSlug?: string;
}
export const readPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
};
const isPositiveId = (value: number) => Number.isSafeInteger(value) && value > 0;
export const isValidTraceRoute = (route: StageTracePageRoute, rawAttempt: unknown) => {
  const hasStageKey = typeof route.stageKey === 'string' && route.stageKey.trim().length > 0;
  const hasValidAttempt = rawAttempt === undefined || readPositiveInteger(rawAttempt) !== undefined;
  return (
    isPositiveId(route.pipelineId) &&
    isPositiveId(route.iterationId) &&
    hasStageKey &&
    hasValidAttempt
  );
};
export const hasResolvedTraceProject = (route: StageTracePageRoute, project: TraceProjectState) => {
  if (!project.projectKey || project.loading) return false;
  return (
    project.activeProjectKey === project.projectKey &&
    project.organizationSlug === route.organizationSlug &&
    project.projectSlug === route.projectSlug
  );
};
export const getSelectedTraceAttempt = (
  attempts: StageTraceAttempt[] = [],
  trace?: StageTrace,
  requestedAttempt?: number,
) => {
  const responseAttempt = attempts.find((item) => item.attempt === trace?.attempt);
  if (responseAttempt) return responseAttempt;
  return attempts.find((item) =>
    requestedAttempt === undefined ? item.current : item.attempt === requestedAttempt,
  );
};
interface TraceReturnQuery {
  returnPipelineId?: unknown;
  returnIterationId?: unknown;
  returnStageKey?: unknown;
}
export const getTraceReturnRoute = (
  route: StageTracePageRoute,
  query: TraceReturnQuery,
): StageTracePageRoute => ({
  ...route,
  pipelineId: readPositiveInteger(query.returnPipelineId) ?? route.pipelineId,
  iterationId: readPositiveInteger(query.returnIterationId) ?? route.iterationId,
  stageKey: typeof query.returnStageKey === 'string' ? query.returnStageKey : route.stageKey,
});
