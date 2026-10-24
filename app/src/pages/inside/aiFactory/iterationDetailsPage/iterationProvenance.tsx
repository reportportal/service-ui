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

import { createClassnames } from 'common/utils';
import type { ReducedPipelineIterationDetail } from 'controllers/aiFactory/pipelines';
import {
  getIterationFixLabel,
  isFixIteration,
} from 'controllers/aiFactory/pipelines/iterationProvenance';
import { IterationReferenceLinks } from 'pages/inside/aiFactory/common/iterationReferences/iterationReferenceLinks';
import { messages } from 'pages/inside/aiFactory/iterationDetailsPage/messages';
import styles from './iterationDetailsPage.scss';

interface IterationProvenanceProps {
  iteration: ReducedPipelineIterationDetail;
  projectKey?: string;
}

const cx = createClassnames(styles);

export const IterationProvenance = ({ iteration, projectKey }: IterationProvenanceProps) => {
  const { formatMessage } = useIntl();
  const isFix = isFixIteration(iteration.attributes);
  if (!isFix && !iteration.rerunOf) return null;
  return (
    <div className={cx('meta')} data-automation-id="iteration-provenance">
      {isFix && <strong>{formatMessage(messages.fixIteration)}</strong>}
      {getIterationFixLabel(iteration.attributes) && (
        <span>{getIterationFixLabel(iteration.attributes)}</span>
      )}
      {!!iteration.rerunOf?.iterationNumber && (
        <span>
          {formatMessage(messages.sourceIteration, { number: iteration.rerunOf.iterationNumber })}
        </span>
      )}
      {iteration.rerunOf && projectKey && (
        <IterationReferenceLinks
          projectKey={projectKey}
          resourceKey={iteration}
          previousIterationId={iteration.rerunOf.id}
          resultIterationId={isFix ? iteration.id : undefined}
        />
      )}
    </div>
  );
};
