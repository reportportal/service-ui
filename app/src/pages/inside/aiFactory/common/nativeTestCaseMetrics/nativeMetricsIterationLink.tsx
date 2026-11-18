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

import { useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import {
  PROJECT_PIPELINE_ITERATION_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectKeySelector } from 'controllers/project';
import type { ProjectDetails } from 'pages/organization/constants';
import { useIterationReferences } from 'pages/inside/aiFactory/common/iterationReferences/useIterationReferences';
import { messages } from 'pages/inside/aiFactory/common/nativeTestCaseMetrics/messages';

interface NativeMetricsIterationLinkProps {
  testCaseId: number;
  iterationId: number;
  iterationNumber?: number;
}

export const NativeMetricsIterationLink = ({
  testCaseId,
  iterationId,
  iterationNumber,
}: NativeMetricsIterationLinkProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const resourceKey = useMemo(
    () => ({ testCaseId, iterationId, organizationSlug, projectSlug, projectKey }),
    [testCaseId, iterationId, organizationSlug, projectSlug, projectKey],
  );
  const requestedScope = useRef<object>();
  const references = useIterationReferences({
    projectKey,
    resourceKey,
    resultIterationId: iterationId,
  });
  useEffect(() => {
    if (requestedScope.current !== resourceKey || !references.isCurrent() || !references.result)
      return;
    requestedScope.current = undefined;
    dispatch({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        pipelineId: references.result.pipelineId,
        iterationId: references.result.id,
      },
    });
  }, [dispatch, organizationSlug, projectSlug, resourceKey, references]);
  const openIteration = () => {
    requestedScope.current = resourceKey;
    void references.load();
  };
  return (
    <div>
      <Button
        variant="text"
        data-automation-id="native-metrics-iteration-link"
        disabled={references.status === 'loading'}
        onClick={openIteration}
      >
        {formatMessage(
          iterationNumber === undefined ? messages.openIteration : messages.iteration,
          { number: iterationNumber },
        )}
      </Button>
      {references.status === 'loading' && (
        <output aria-live="polite">{formatMessage(messages.loading)}</output>
      )}
      {references.status === 'error' && <span role="alert">{formatMessage(messages.error)}</span>}
      {references.status === 'unavailable' && <span>{formatMessage(messages.unavailable)}</span>}
    </div>
  );
};
