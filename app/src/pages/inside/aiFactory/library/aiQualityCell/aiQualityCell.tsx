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
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { PROJECT_PIPELINE_ITERATION_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { CostLabel, ScoreChip } from 'pages/inside/aiFactory/common';
import type { ProjectDetails } from 'pages/organization/constants';
import { EvaluationState, StageKey } from 'types/aiFactory';
import type { TestCaseAiExtension } from 'types/aiFactory';

import { messages } from './messages';
import styles from './aiQualityCell.scss';

const cx = createClassnames(styles);

export interface AiQualityCellProps {
  ai?: TestCaseAiExtension['ai'];
  evaluationSummary?: TestCaseAiExtension['evaluationSummary'];
  costSummary?: TestCaseAiExtension['costSummary'];
}

interface IterationLinkProps {
  iteration: NonNullable<TestCaseAiExtension['ai']>['generatedByIteration'];
}

const IterationLink = ({ iteration }: IterationLinkProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;

  return (
    <Link
      className={cx('quality-cell__link')}
      to={{
        type: PROJECT_PIPELINE_ITERATION_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          pipelineId: iteration.pipelineId,
          iterationId: iteration.iterationId,
        },
        query: { stage: StageKey.GRADE },
      }}
    >
      {formatMessage(messages.iterationLink, { number: iteration.number })}
    </Link>
  );
};

export const AiQualityCell = ({ ai, evaluationSummary, costSummary }: AiQualityCellProps) => {
  if (!ai || !evaluationSummary) {
    return (
      <div className={cx('quality-cell')}>
        <span className={cx('quality-cell__empty')}>—</span>
      </div>
    );
  }

  const iteration = ai?.generatedByIteration;

  return (
    <div className={cx('quality-cell')}>
      <ScoreChip
        score={evaluationSummary.totalScore}
        obsolete={evaluationSummary.state === EvaluationState.OBSOLETE}
      />
      {costSummary?.approxTotal !== undefined && <CostLabel amount={costSummary.approxTotal} />}
      {iteration && <IterationLink iteration={iteration} />}
    </div>
  );
};
