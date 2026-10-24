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

import { isPositiveIterationId } from 'controllers/aiFactory/pipelines/iterationProvenance';
import {
  areIterationReferencesCoherent,
  getLiveIterationIdentity,
  type LiveIterationIdentity,
} from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';

export interface IterationReferencesOptions {
  projectKey: string;
  resourceKey: object;
  previousIterationId?: number;
  resultIterationId?: number;
  isEnabled?: boolean;
}

interface ReferencesState {
  scope?: object;
  status: 'idle' | 'loading' | 'ready' | 'error' | 'unavailable';
  previous?: LiveIterationIdentity;
  result?: LiveIterationIdentity;
}

const collectReferences = (
  ids: number[],
  values: Array<LiveIterationIdentity | undefined>,
  previousId?: number,
  resultId?: number,
): Omit<ReferencesState, 'scope'> => {
  if (values.some((value) => !value)) return { status: 'unavailable' };
  const previous = values[ids.indexOf(previousId)];
  const result = values[ids.indexOf(resultId)];
  if (previous && result && !areIterationReferencesCoherent(previous, result))
    return { status: 'unavailable' };
  return { status: 'ready', previous, result };
};

export const useIterationReferences = ({
  projectKey,
  resourceKey,
  previousIterationId,
  resultIterationId,
  isEnabled = true,
}: IterationReferencesOptions) => {
  const scope = useMemo(
    () => ({
      projectKey,
      resourceKey,
      previousIterationId,
      resultIterationId,
      isEnabled,
      active: true,
      controller: undefined as AbortController | undefined,
    }),
    [projectKey, resourceKey, previousIterationId, resultIterationId, isEnabled],
  );
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const [state, setState] = useState<ReferencesState>({ status: 'idle' });
  const isCurrent = () => scope.active && currentScope.current === scope && isEnabled;
  useEffect(() => {
    scope.active = true;
    return () => {
      scope.active = false;
      scope.controller?.abort();
    };
  }, [scope]);
  const load = async () => {
    if (!isCurrent() || scope.controller || !projectKey) return;
    const ids = [
      ...new Set([previousIterationId, resultIterationId].filter(isPositiveIterationId)),
    ];
    if (!ids.length) {
      setState({ scope, status: 'unavailable' });
      return;
    }
    const controller = new AbortController();
    scope.controller = controller;
    setState({ scope, status: 'loading' });
    try {
      const values = await Promise.all(
        ids.map((id) => getLiveIterationIdentity(projectKey, id, controller.signal)),
      );
      if (isCurrent())
        setState({
          scope,
          ...collectReferences(ids, values, previousIterationId, resultIterationId),
        });
    } catch {
      controller.abort();
      if (isCurrent()) setState({ scope, status: 'error' });
    } finally {
      if (scope.controller === controller) scope.controller = undefined;
    }
  };
  const currentState = state.scope === scope && isEnabled ? state : { status: 'idle' as const };
  return { ...currentState, load, isCurrent };
};
