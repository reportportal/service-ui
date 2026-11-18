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

import {
  loadLiveFixRoundHistory,
  type NativeFixRound,
} from 'pages/inside/aiFactory/review/liveFixRounds';

interface HistoryState {
  resource: object;
  rounds?: NativeFixRound[];
  error?: boolean;
}

export const useLiveFixRoundHistory = (
  projectKey: string,
  testCaseId: number,
  resourceKey: object,
  currentRound?: NativeFixRound,
) => {
  const [requested, setRequested] = useState<object>();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<HistoryState>();
  const enabled = requested === resourceKey && Boolean(projectKey) && testCaseId > 0;
  const resource = useMemo(
    () => ({
      projectKey,
      testCaseId,
      resourceKey,
      revision,
      id: currentRound?.id,
      status: currentRound?.status,
      result: currentRound?.resultIterationId,
    }),
    [
      projectKey,
      testCaseId,
      resourceKey,
      revision,
      currentRound?.id,
      currentRound?.status,
      currentRound?.resultIterationId,
    ],
  );
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    loadLiveFixRoundHistory(projectKey, testCaseId, controller.signal)
      .then((rounds) => {
        if (!controller.signal.aborted) setState({ resource, rounds });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ resource, error: true });
      });
    return () => controller.abort();
  }, [enabled, resource, projectKey, testCaseId]);
  const current = enabled && state?.resource === resource ? state : undefined;
  const load = () => {
    setRequested(resourceKey);
    setRevision((value) => value + 1);
  };
  return {
    load,
    enabled,
    loading: enabled && !current,
    rounds: current?.rounds,
    error: current?.error,
    resource,
  };
};
