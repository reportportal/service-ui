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

import { useLayoutEffect, useMemo, useRef, useState } from 'react';

interface TraceRequestScope {
  readonly resource: object;
  readonly enabled: boolean;
}

interface TraceRequestRuntime {
  scope: TraceRequestScope;
  controller?: AbortController;
}

interface TraceRequestState<T> {
  scope: TraceRequestScope;
  loading?: boolean;
  data?: T;
  error?: boolean;
}

export const useScopedTraceRequest = <T>(resource: object, enabled: boolean) => {
  const scope = useMemo<TraceRequestScope>(() => ({ resource, enabled }), [resource, enabled]);
  const committedRuntime = useRef<TraceRequestRuntime>();
  const [state, setState] = useState<TraceRequestState<T>>();
  const isCurrent = () => scope.enabled && committedRuntime.current?.scope === scope;

  useLayoutEffect(() => {
    const runtime: TraceRequestRuntime = { scope };
    committedRuntime.current = runtime;
    return () => {
      runtime.controller?.abort();
      if (committedRuntime.current === runtime) committedRuntime.current = undefined;
    };
  }, [scope]);

  const execute = async (
    controller: AbortController,
    request: (signal: AbortSignal) => Promise<T>,
    onSuccess?: (data: T) => void,
  ) => {
    const data = await request(controller.signal);
    if (!isCurrent() || controller.signal.aborted) return;
    setState({ scope, data });
    onSuccess?.(data);
  };

  const run = (request: (signal: AbortSignal) => Promise<T>, onSuccess?: (data: T) => void) => {
    const runtime = committedRuntime.current;
    if (!isCurrent() || !runtime || runtime.controller) return;
    const controller = new AbortController();
    runtime.controller = controller;
    setState({ scope, loading: true });
    execute(controller, request, onSuccess)
      .catch(() => {
        if (isCurrent() && !controller.signal.aborted) setState({ scope, error: true });
      })
      .finally(() => {
        if (runtime.controller === controller) runtime.controller = undefined;
      });
  };

  const current = state?.scope === scope ? state : undefined;
  return { loading: current?.loading, data: current?.data, error: current?.error, isCurrent, run };
};
