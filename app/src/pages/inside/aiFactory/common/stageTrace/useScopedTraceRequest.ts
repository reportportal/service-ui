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

import { useEffect, useMemo, useRef, useState } from 'react';

interface TraceRequestScope {
  resource: object;
  enabled: boolean;
  active: boolean;
  controller?: AbortController;
}

interface TraceRequestState<T> {
  scope: TraceRequestScope;
  loading?: boolean;
  data?: T;
  error?: boolean;
}

export const useScopedTraceRequest = <T>(resource: object, enabled: boolean) => {
  const scope = useMemo<TraceRequestScope>(
    () => ({ resource, enabled, active: true }),
    [resource, enabled],
  );
  const latestScope = useRef(scope);
  // Invalidate old event handlers during render, before effect cleanup runs.
  latestScope.current = scope;
  const [state, setState] = useState<TraceRequestState<T>>();
  const isCurrent = () => scope.enabled && scope.active && latestScope.current === scope;

  useEffect(() => {
    scope.active = true;
    return () => {
      scope.active = false;
      scope.controller?.abort();
    };
  }, [scope]);

  const run = async (
    request: (signal: AbortSignal) => Promise<T>,
    onSuccess?: (data: T) => void,
  ) => {
    if (!isCurrent() || scope.controller) return;
    const controller = new AbortController();
    scope.controller = controller;
    setState({ scope, loading: true });
    try {
      const data = await request(controller.signal);
      if (!isCurrent() || controller.signal.aborted) return;
      setState({ scope, data });
      onSuccess?.(data);
    } catch {
      if (isCurrent() && !controller.signal.aborted) setState({ scope, error: true });
    } finally {
      if (scope.controller === controller) scope.controller = undefined;
    }
  };

  const current = state?.scope === scope ? state : undefined;
  return { loading: current?.loading, data: current?.data, error: current?.error, isCurrent, run };
};
