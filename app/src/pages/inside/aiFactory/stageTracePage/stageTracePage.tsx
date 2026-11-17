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

import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  PROJECT_PIPELINE_STAGE_TRACE_PAGE,
} from 'controllers/pages';
import { SettingsLayout } from 'layouts/settingsLayout';
import { StageTraceHeader } from 'pages/inside/aiFactory/stageTracePage/stageTraceHeader';
import { StageTraceAttemptSwitcher } from 'pages/inside/aiFactory/stageTracePage/stageTraceAttemptSwitcher';
import { StageTraceContent } from 'pages/inside/aiFactory/stageTracePage/stageTraceContent';
import { useStageTrace } from 'pages/inside/aiFactory/stageTracePage/useStageTrace';
import { useStageTracePageRoute } from 'pages/inside/aiFactory/stageTracePage/useStageTracePageRoute';
import {
  getSelectedTraceAttempt,
  getTraceReturnRoute,
  readPositiveInteger,
} from 'pages/inside/aiFactory/stageTracePage/stageTracePageUtils';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

const cx = createClassnames(styles);
export const StageTracePage = () => {
  const dispatch = useDispatch();
  const isEnabled = useAiFactoryEnabled();
  const { route, query, projectKey, projectName, hasProject, attempt, isValidRoute } =
    useStageTracePageRoute();
  const { organizationSlug, projectSlug, pipelineId, iterationId, stageKey } = route;
  const [refresh, setRefresh] = useState(0);
  const state = useStageTrace({
    resource: { projectKey, iterationId, stageKey },
    pipelineId,
    attempt,
    enabled: isEnabled && isValidRoute && hasProject,
    refresh,
  });
  useEffect(() => {
    if (!isEnabled)
      dispatch({ type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } });
  }, [dispatch, isEnabled, organizationSlug, projectSlug]);
  const onBack = () => {
    const { stageKey: returnStageKey, ...payload } = getTraceReturnRoute(route, query);
    dispatch({ type: PROJECT_PIPELINE_ITERATION_PAGE, payload, query: { stage: returnStageKey } });
  };
  const onAttempt = (value: string) =>
    dispatch({
      type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
      payload: route,
      query: { ...query, attempt: value },
    });
  const onRefresh = useCallback(() => setRefresh((value) => value + 1), []);
  if (!isEnabled) return null;
  const selectedAttempt = getSelectedTraceAttempt(state.attempts, state.trace, attempt);
  const isLoading = state.loading || (isValidRoute && !hasProject);
  return (
    <SettingsLayout>
      <div className={cx('page')} data-automation-id="stageTracePage">
        <StageTraceHeader
          route={route}
          projectName={projectName}
          iteration={state.iteration}
          attempt={selectedAttempt}
          fixRound={stageKey === 'fix' ? readPositiveInteger(query.fixRoundNumber) : undefined}
          isLoading={isLoading}
          onBack={onBack}
          onRefresh={onRefresh}
        />
        <StageTraceAttemptSwitcher
          attempts={state.attempts}
          selectedAttempt={selectedAttempt?.attempt ?? attempt}
          onChange={onAttempt}
        />
        <StageTraceContent
          state={state}
          stageKey={stageKey}
          attempt={selectedAttempt}
          failure={isValidRoute ? state.failure : 'INVALID_RESPONSE'}
          isLoading={isLoading}
        />
      </div>
    </SettingsLayout>
  );
};
