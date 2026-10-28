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

import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@reportportal/ui-kit';

import {
  PROJECT_PIPELINE_COMPARISON_PAGE,
  PROJECT_PIPELINE_ITERATION_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import {
  useIterationReferences,
  type IterationReferencesOptions,
} from 'pages/inside/aiFactory/common/iterationReferences/useIterationReferences';
import type { LiveIterationIdentity } from 'pages/inside/aiFactory/common/iterationReferences/liveIterationIdentity';
import { messages } from 'pages/inside/aiFactory/common/iterationReferences/messages';

export interface IterationReferenceLinksProps extends IterationReferencesOptions {
  isEnabled?: boolean;
}

export const IterationReferenceLinks = (props: IterationReferenceLinksProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const references = useIterationReferences(props);
  const openIteration = (iteration: LiveIterationIdentity) => {
    if (!references.isCurrent()) return;
    dispatch({
      type: PROJECT_PIPELINE_ITERATION_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        pipelineId: iteration.pipelineId,
        iterationId: iteration.id,
      },
    });
  };
  const compare = () => {
    if (!references.isCurrent() || !references.previous || !references.result) return;
    dispatch({
      type: PROJECT_PIPELINE_COMPARISON_PAGE,
      payload: { organizationSlug, projectSlug },
      query: {
        pipeline: String(references.result.pipelineId),
        baseline: String(references.previous.id),
        candidate: String(references.result.id),
      },
    });
  };
  if (props.isEnabled === false) return null;
  return (
    <div data-automation-id="iteration-reference-links">
      {references.status === 'idle' && (
        <Button
          variant="text"
          data-automation-id="load-iteration-links"
          onClick={() => void references.load()}
        >
          {formatMessage(messages.load)}
        </Button>
      )}
      {references.status === 'loading' && (
        <output aria-live="polite">{formatMessage(messages.loading)}</output>
      )}
      {references.status === 'error' && (
        <>
          <span role="alert">{formatMessage(messages.error)}</span>
          <Button
            variant="text"
            data-automation-id="retry-iteration-links"
            onClick={() => void references.load()}
          >
            {formatMessage(messages.retry)}
          </Button>
        </>
      )}
      {references.status === 'unavailable' && <span>{formatMessage(messages.unavailable)}</span>}
      {references.previous && (
        <Button
          variant="text"
          data-automation-id="source-iteration-link"
          onClick={() => openIteration(references.previous)}
        >
          {formatMessage(messages.previous, { number: references.previous.number })}
        </Button>
      )}
      {references.result && (
        <Button
          variant="text"
          data-automation-id="fix-iteration-link"
          onClick={() => openIteration(references.result)}
        >
          {formatMessage(messages.result, { number: references.result.number })}
        </Button>
      )}
      {references.previous && references.result && (
        <Button variant="text" data-automation-id="compare-fix-iterations" onClick={compare}>
          {formatMessage(messages.compare)}
        </Button>
      )}
    </div>
  );
};
