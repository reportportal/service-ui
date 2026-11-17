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
import { isPositiveIterationId } from 'controllers/aiFactory/pipelines/iterationProvenance';
import {
  adaptLiveIterationIdentity,
  type LiveIterationIdentity,
} from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';

export interface LiveFixTraceTarget extends LiveIterationIdentity {
  stageKey: string;
}

export const isFixStageKey = (stageKey: unknown): stageKey is string =>
  typeof stageKey === 'string' && ['fix', 'test-case-fix'].includes(stageKey.trim().toLowerCase());

const resolveFixStageKey = (response: unknown): string | undefined => {
  if (!response || typeof response !== 'object' || !('stages' in response)) return undefined;
  if (!Array.isArray(response.stages)) return undefined;
  const keys = response.stages.flatMap((stage: unknown) => {
    if (!stage || typeof stage !== 'object' || !('stageKey' in stage)) return [];
    return isFixStageKey(stage.stageKey) ? [stage.stageKey] : [];
  });
  return keys.length === 1 ? keys[0] : undefined;
};

export const getLiveFixTraceTarget = async (
  projectKey: string,
  resultIterationId: number,
  signal: AbortSignal,
): Promise<LiveFixTraceTarget | undefined> => {
  if (!projectKey || !isPositiveIterationId(resultIterationId)) return undefined;
  const response: unknown = await fetch(URLS.pipelineIterationById(projectKey, resultIterationId), {
    signal,
  });
  const identity = adaptLiveIterationIdentity(response, resultIterationId);
  const stageKey = resolveFixStageKey(response);
  return identity && stageKey ? { ...identity, stageKey } : undefined;
};
