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
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, RefreshIcon, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  PROJECT_DASHBOARD_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  PROJECT_PIPELINES_PAGE,
  PROJECT_PIPELINE_STAGE_TRACE_PAGE,
  pipelineIdSelector,
  iterationIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import {
  projectKeySelector,
  projectInfoLoadingSelector,
  projectNameSelector,
} from 'controllers/project';
import { activeProjectSelector, activeProjectKeySelector } from 'controllers/user';
import { SettingsLayout } from 'layouts/settingsLayout';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import type { ProjectDetails } from 'pages/organization/constants';
import { StageTraceTimeline } from 'pages/inside/aiFactory/stageTracePage/stageTraceTimeline';
import { StageTraceSnapshot } from 'pages/inside/aiFactory/stageTracePage/stageTraceSnapshot';
import { useStageTrace, TraceFailure } from 'pages/inside/aiFactory/stageTracePage/useStageTrace';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

const cx = createClassnames(styles);
const stageKeySelector = (state: { location?: { payload?: { stageKey?: string } } }) =>
  state.location?.payload?.stageKey ?? '';
export const readPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
};
const FAILURE_MESSAGES: Record<TraceFailure, keyof typeof messages> = {
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'notFound',
  INVALID_RESPONSE: 'invalid',
  REQUEST_FAILED: 'failed',
};

export const StageTracePage = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const isEnabled = useAiFactoryEnabled();
  const projectKey = useSelector(projectKeySelector);
  const projectName = useSelector(projectNameSelector);
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const activeProject = useSelector(activeProjectSelector) as Partial<ProjectDetails>;
  const projectLoading = useSelector(projectInfoLoadingSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const pipelineId = useSelector(pipelineIdSelector);
  const iterationId = useSelector(iterationIdSelector);
  const stageKey = useSelector(stageKeySelector);
  const query = useSelector(querySelector);
  const [refresh, setRefresh] = useState(0);
  const attempt = readPositiveInteger(query.attempt);
  const isValidRoute =
    Number.isSafeInteger(pipelineId) &&
    pipelineId > 0 &&
    Number.isSafeInteger(iterationId) &&
    iterationId > 0 &&
    typeof stageKey === 'string' &&
    stageKey.trim().length > 0 &&
    (query.attempt === undefined || attempt !== undefined);
  const hasProject = Boolean(
    projectKey &&
    !projectLoading &&
    activeProjectKey === projectKey &&
    activeProject.organizationSlug === organizationSlug &&
    activeProject.projectSlug === projectSlug,
  );
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
  if (!isEnabled) return null;
  const selectedAttempt =
    state.attempts?.find((item) => item.attempt === state.trace?.attempt) ??
    state.attempts?.find((item) =>
      attempt === undefined ? item.current : item.attempt === attempt,
    );
  const iteration = state.iteration;
  const stage = iteration?.stages.find((item) => item.stageKey === stageKey);
  const fixRound = stageKey === 'fix' ? readPositiveInteger(query.fixRoundNumber) : undefined;
  const title = [
    formatMessage(messages.title),
    iteration?.pipelineName ?? formatMessage(messages.pipeline, { id: pipelineId }),
    iteration
      ? formatMessage(messages.iteration, { number: iteration.number })
      : formatMessage(messages.iterationId, { id: iterationId }),
    stage?.label ?? stageKey,
    fixRound && formatMessage(messages.fixRound, { number: fixRound }),
  ]
    .filter(Boolean)
    .join(' · ');
  const onBack = () =>
    dispatch({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        pipelineId: readPositiveInteger(query.returnPipelineId) ?? pipelineId,
        iterationId: readPositiveInteger(query.returnIterationId) ?? iterationId,
      },
      query: { stage: typeof query.returnStageKey === 'string' ? query.returnStageKey : stageKey },
    });
  const onAttempt = (value: string) =>
    dispatch({
      type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
      payload: { organizationSlug, projectSlug, pipelineId, iterationId, stageKey },
      query: { ...query, attempt: value },
    });
  const failure = !isValidRoute ? 'INVALID_RESPONSE' : state.failure;
  const isLoading = state.loading || (isValidRoute && !hasProject);
  return (
    <SettingsLayout>
      <div className={cx('page')} data-automation-id="stageTracePage">
        <div className={cx('header')}>
          <PageHeaderWithBreadcrumbsAndActions
            title={title}
            stackActionsAtNarrowWidth
            breadcrumbDescriptors={[
              {
                id: 'project',
                title: projectName || projectSlug,
                onClick: () =>
                  dispatch({
                    type: PROJECT_DASHBOARD_PAGE,
                    payload: { organizationSlug, projectSlug },
                  }),
              },
              {
                id: 'pipelines',
                title: formatMessage(messages.pipelines),
                onClick: () =>
                  dispatch({
                    type: PROJECT_PIPELINES_PAGE,
                    payload: { organizationSlug, projectSlug },
                  }),
              },
              {
                id: 'iteration',
                title: iteration
                  ? formatMessage(messages.iteration, { number: iteration.number })
                  : formatMessage(messages.iterationId, { id: iterationId }),
                onClick: () =>
                  dispatch({
                    type: PROJECT_PIPELINE_ITERATION_PAGE,
                    payload: { organizationSlug, projectSlug, pipelineId, iterationId },
                    query: { stage: stageKey },
                  }),
              },
              { id: 'trace', title: stage?.label ?? stageKey },
            ]}
            titleAddon={
              (selectedAttempt?.stageStatus ?? selectedAttempt?.stageStatusCategory) && (
                <span
                  className={cx('status', {
                    'status--failed': selectedAttempt.stageStatusCategory === 'FAILED',
                    'status--passed': selectedAttempt.stageStatusCategory === 'PASSED',
                  })}
                >
                  {selectedAttempt.stageStatus ?? selectedAttempt.stageStatusCategory}
                </span>
              )
            }
            actions={
              <div className={cx('header__actions')}>
                <Button variant="text" onClick={onBack} data-automation-id="backFromStageTrace">
                  {formatMessage(messages.back)}
                </Button>
                <Button
                  variant="text"
                  icon={<RefreshIcon />}
                  onClick={() => setRefresh((value) => value + 1)}
                  disabled={isLoading}
                  data-automation-id="refreshStageTrace"
                >
                  {formatMessage(messages.refresh)}
                </Button>
              </div>
            }
          />
        </div>
        {(state.attempts?.length ?? 0) > 1 && (
          <label className={cx('attempt-switcher')}>
            {formatMessage(messages.attempts)}
            <select
              value={selectedAttempt?.attempt ?? attempt ?? ''}
              onChange={(event) => onAttempt(event.target.value)}
              data-automation-id="stageTraceAttemptSwitcher"
            >
              {state.attempts.map((item) => (
                <option key={item.attempt} value={item.attempt}>
                  {formatMessage(messages.attempt, { number: item.attempt })}
                  {item.current ? ` · ${formatMessage(messages.current)}` : ''}
                  {item.stageStatus ? ` · ${item.stageStatus}` : ''}
                  {` · ${formatMessage(item.traceStatus === 'REPORTED' ? messages.reported : messages.notReported)}`}
                </option>
              ))}
            </select>
          </label>
        )}
        {failure && (
          <SystemMessage mode="error">
            <output aria-live="assertive">
              {formatMessage(messages[FAILURE_MESSAGES[failure]])}
            </output>
          </SystemMessage>
        )}
        {!failure && isLoading && (
          <output className={cx('state')} aria-live="polite">
            {formatMessage(messages.loading)}
          </output>
        )}
        {!failure && !isLoading && (
          <div className={cx('body')}>
            <main className={cx('main')}>
              {state.trace?.status === 'NOT_REPORTED' && (
                <SystemMessage mode="info">
                  <output aria-live="polite">
                    {formatMessage(messages.notReported)}
                    {state.trace.reason && <p className={cx('reason')}>{state.trace.reason}</p>}
                  </output>
                </SystemMessage>
              )}
              {state.trace?.status === 'REPORTED' && state.trace.events.length === 0 && (
                <SystemMessage mode="info">{formatMessage(messages.empty)}</SystemMessage>
              )}
              {state.trace?.status === 'REPORTED' && state.trace.events.length > 0 && (
                <StageTraceTimeline
                  key={`${state.scope}:${state.trace.attempt}`}
                  events={state.trace.events}
                />
              )}
              {state.trace?.reportedAt && (
                <p>
                  {formatMessage(messages.reportedAt)}:{' '}
                  {new Date(state.trace.reportedAt).toLocaleString()}
                </p>
              )}
            </main>
            <StageTraceSnapshot
              iteration={iteration}
              stageKey={stageKey}
              attempt={selectedAttempt}
              hasError={state.metadataFailed}
            />
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};
