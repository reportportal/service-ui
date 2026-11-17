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

import { useEffect, useState } from 'react';

import {
  loadStageTrace,
  loadStageTraceAttempts,
  loadTraceIteration,
  StageTrace,
  StageTraceAttempt,
  TraceResource,
  StageTraceErrorReason,
} from 'controllers/aiFactory/stageTrace';
import type { ReducedPipelineIterationDetail } from 'controllers/aiFactory/pipelines';

export type TraceFailure = StageTraceErrorReason;
export interface StageTraceState {
  scope: string;
  attempts?: StageTraceAttempt[];
  trace?: StageTrace;
  iteration?: ReducedPipelineIterationDetail;
  failure?: TraceFailure;
  metadataFailed?: boolean;
  loading: boolean;
}
export interface UseStageTraceOptions {
  resource: TraceResource;
  pipelineId: number;
  attempt?: number;
  enabled: boolean;
  refresh: number;
}
const getFailure = (error: unknown): TraceFailure => {
  const reason = (error as { reason?: TraceFailure })?.reason;
  return ['FORBIDDEN', 'NOT_FOUND', 'INVALID_RESPONSE', 'REQUEST_FAILED'].includes(reason)
    ? reason
    : 'REQUEST_FAILED';
};

export const useStageTrace = ({
  resource,
  pipelineId,
  attempt,
  enabled,
  refresh,
}: UseStageTraceOptions) => {
  const { projectKey, iterationId, stageKey } = resource;
  const scope = JSON.stringify([projectKey, pipelineId, iterationId, stageKey, attempt, refresh]);
  const [state, setState] = useState<StageTraceState>({ scope: '', loading: true });
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    const update = (patch: Partial<StageTraceState>) => {
      if (!signal.aborted) {
        setState((previous) => ({
          ...(previous.scope === scope ? previous : { loading: true }),
          ...patch,
          scope,
        }));
      }
    };
    loadTraceIteration(projectKey, pipelineId, iterationId, signal)
      .then((iteration) => update({ iteration }))
      .catch(() => update({ metadataFailed: true }));
    const readTrace = async () => {
      try {
        const attempts = await loadStageTraceAttempts(
          { projectKey, iterationId, stageKey },
          signal,
        );
        if (signal.aborted) return;
        update({ attempts });
        const selected = attempt ?? attempts.find((item) => item.current)?.attempt;
        if (selected === undefined) {
          update({ failure: 'INVALID_RESPONSE', loading: false });
          return;
        }
        const trace = await loadStageTrace(
          { projectKey, iterationId, stageKey, attempt: selected },
          signal,
        );
        if (signal.aborted) return;
        update({ trace, loading: false });
      } catch (error) {
        update({ failure: getFailure(error), loading: false });
      }
    };
    void readTrace();
    return () => controller.abort();
  }, [enabled, projectKey, pipelineId, iterationId, stageKey, attempt, refresh, scope]);
  return enabled && state.scope === scope ? state : { scope, loading: enabled };
};
