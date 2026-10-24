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
import {
  adaptIterationReference,
  isPositiveIterationId,
  type IterationReference,
} from 'controllers/aiFactory/pipelines/iterationProvenance';

export interface LiveIterationIdentity {
  id: number;
  pipelineId: number;
  number: number;
  rerunOf?: IterationReference;
}

export const adaptLiveIterationIdentity = (
  value: unknown,
  expectedId: number,
): LiveIterationIdentity | undefined => {
  if (
    !isPositiveIterationId(expectedId) ||
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value)
  )
    return undefined;
  const raw = value as Record<string, unknown>;
  if (
    raw.id !== expectedId ||
    !isPositiveIterationId(raw.pipelineId) ||
    !isPositiveIterationId(raw.iterationNumber)
  )
    return undefined;
  const rerunOf = adaptIterationReference(raw.rerunOf);
  if (raw.rerunOf != null && !rerunOf) return undefined;
  return { id: expectedId, pipelineId: raw.pipelineId, number: raw.iterationNumber, rerunOf };
};

export const getLiveIterationIdentity = async (
  projectKey: string,
  iterationId: number,
  signal: AbortSignal,
): Promise<LiveIterationIdentity | undefined> => {
  if (!projectKey || !isPositiveIterationId(iterationId)) return undefined;
  const response = await fetch(URLS.pipelineIterationById(projectKey, iterationId), { signal });
  return adaptLiveIterationIdentity(response, iterationId);
};

export const areIterationReferencesCoherent = (
  previous: LiveIterationIdentity,
  result: LiveIterationIdentity,
): boolean =>
  previous.id !== result.id &&
  previous.pipelineId === result.pipelineId &&
  (result.rerunOf === undefined ||
    (result.rerunOf.id === previous.id &&
      (result.rerunOf.iterationNumber === undefined ||
        result.rerunOf.iterationNumber === previous.number)));
