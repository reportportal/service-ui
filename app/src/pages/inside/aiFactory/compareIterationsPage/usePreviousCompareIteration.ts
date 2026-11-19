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

import { useEffect, useMemo, useState } from 'react';

import { resolvePreviousCompareIteration } from './compareIterationHistory';

type LookupResult = { status: 'loaded'; baselineId: number | null } | { status: 'error' };

export const usePreviousCompareIteration = (
  projectKey: string,
  pipelineId: number | null,
  candidateId: number | null,
) => {
  const [attempt, setAttempt] = useState(0);
  const scope = useMemo(
    () => ({ projectKey, pipelineId, candidateId, attempt }),
    [projectKey, pipelineId, candidateId, attempt],
  );
  const [result, setResult] = useState<{ scope: typeof scope; outcome: LookupResult }>();
  const isEnabled = Boolean(projectKey && pipelineId && candidateId);

  useEffect(() => {
    if (!scope.projectKey || !scope.pipelineId || !scope.candidateId) return undefined;
    const controller = new AbortController();
    const request = {
      projectKey: scope.projectKey,
      pipelineId: scope.pipelineId,
      signal: controller.signal,
    };
    void resolvePreviousCompareIteration(request, scope.candidateId)
      .then((previous) => {
        if (!controller.signal.aborted) {
          setResult({ scope, outcome: { status: 'loaded', baselineId: previous?.id ?? null } });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ scope, outcome: { status: 'error' } });
      });

    return () => controller.abort();
  }, [scope]);

  const outcome = result?.scope === scope ? result.outcome : undefined;
  return {
    isLoading: isEnabled && !outcome,
    hasError: outcome?.status === 'error',
    baselineId: outcome?.status === 'loaded' ? outcome.baselineId : null,
    retry: () => setAttempt((current) => current + 1),
  };
};
