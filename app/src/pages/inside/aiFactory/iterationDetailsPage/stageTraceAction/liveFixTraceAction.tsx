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
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  PROJECT_PIPELINE_STAGE_TRACE_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { getLiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import { ProjectDetails } from 'pages/organization/constants';

import { messages } from './messages';

export interface LiveFixTraceActionProps {
  projectKey: string;
  resourceKey: object;
  resultIterationId: number;
  roundNumber: number;
}

export const LiveFixTraceAction = ({
  projectKey,
  resourceKey,
  resultIterationId,
  roundNumber,
}: LiveFixTraceActionProps) => {
  const { formatMessage } = useIntl();
  const enabled = useAiFactoryEnabled();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const scope = useMemo(
    () => ({
      projectKey,
      resourceKey,
      resultIterationId,
      roundNumber,
      enabled,
      active: true,
      controller: undefined as AbortController | undefined,
    }),
    [projectKey, resourceKey, resultIterationId, roundNumber, enabled],
  );
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const [state, setState] = useState<{ scope: object; loading?: boolean; error?: boolean }>();
  const isCurrent = () => enabled && scope.active && currentScope.current === scope;
  useEffect(() => {
    scope.active = true;
    return () => {
      scope.active = false;
      scope.controller?.abort();
    };
  }, [scope]);
  const open = async () => {
    if (!isCurrent() || scope.controller || !projectKey) return;
    const controller = new AbortController();
    scope.controller = controller;
    setState({ scope, loading: true });
    try {
      const iteration = await getLiveIterationIdentity(
        projectKey,
        resultIterationId,
        controller.signal,
      );
      if (!isCurrent() || controller.signal.aborted) return;
      if (!iteration) {
        setState({ scope, error: true });
        return;
      }
      setState({ scope });
      dispatch({
        type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          pipelineId: iteration.pipelineId,
          iterationId: iteration.id,
          stageKey: 'fix',
        },
        query: { fixRoundNumber: String(roundNumber) },
      });
    } catch {
      if (isCurrent() && !controller.signal.aborted) setState({ scope, error: true });
    } finally {
      if (scope.controller === controller) scope.controller = undefined;
    }
  };
  if (!enabled) return null;
  const current = state?.scope === scope ? state : undefined;
  return (
    <div data-automation-id="live-fix-trace-action">
      <Button variant="text" disabled={current?.loading} onClick={() => void open()}>
        {formatMessage(messages.openFix, { number: roundNumber })}
      </Button>
      {current?.loading && <output aria-live="polite">{formatMessage(messages.resolving)}</output>}
      {current?.error && <span role="alert">{formatMessage(messages.unresolved)}</span>}
    </div>
  );
};
