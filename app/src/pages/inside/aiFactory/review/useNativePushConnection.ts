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

import { useCallback, useEffect, useMemo, useState } from 'react';

import { getLiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import { usePipelineCiConnection } from 'pages/inside/aiFactory/pipelineSettings/usePipelineCiConnection';

export const useNativePushConnection = (projectKey: string, iterationId?: number) => {
  const [lookupAttempt, setLookupAttempt] = useState(0);
  const scope = useMemo(
    () => ({ projectKey, iterationId, lookupAttempt }),
    [projectKey, iterationId, lookupAttempt],
  );
  const [source, setSource] = useState<{ scope: typeof scope; pipelineId: number }>();

  useEffect(() => {
    if (!scope.projectKey || scope.iterationId === undefined) return undefined;
    const controller = new AbortController();
    void getLiveIterationIdentity(scope.projectKey, scope.iterationId, controller.signal)
      .then((iteration) => {
        if (iteration && !controller.signal.aborted) {
          setSource({ scope, pipelineId: iteration.pipelineId });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setSource(undefined);
      });

    return () => controller.abort();
  }, [scope]);

  const pipelineId = source?.scope === scope ? source.pipelineId : undefined;
  const { connection, refresh } = usePipelineCiConnection(projectKey, pipelineId);
  const refreshPushConnection = useCallback(() => {
    if (iterationId === undefined) return;
    if (pipelineId === undefined) {
      setLookupAttempt((attempt) => attempt + 1);
    } else {
      refresh();
    }
  }, [iterationId, pipelineId, refresh]);

  return { canStartPush: connection?.canStartJobs === true, refreshPushConnection };
};
