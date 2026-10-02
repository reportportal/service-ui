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
import { CollapsibleSection } from 'components/collapsibleSection';
import { CostLabel } from 'pages/inside/aiFactory/common';
import { AiIterationLink } from 'pages/inside/aiFactory/library/aiQualityCell';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import type { TestCaseAiExtension } from 'types/aiFactory';

import { CriterionScore, renderEvaluationContent } from './evaluationShared';
import { normalizeCriteria } from './evaluationUtils';
import { messages } from './messages';

import styles from './evaluationMini.scss';

const cx = createClassnames(styles);

export interface EvaluationMiniProps {
  aiDetailsState: TestCaseAiLoadState;
  iteration: NonNullable<TestCaseAiExtension['ai']>['generatedByIteration'];
}

export const EvaluationMini = ({ aiDetailsState, iteration }: EvaluationMiniProps) => {
  const { formatMessage } = useIntl();
  const { data, isLoading, isError, reload } = aiDetailsState;
  const evaluation = data?.evaluation;
  const criteria = normalizeCriteria(evaluation?.criteria);

  const evaluationContent = evaluation ? (
    <div className={cx('evaluation-mini')} data-automation-id="aiEvaluationMini">
      <ul className={cx('evaluation-mini__criteria')}>
        {criteria.map((criterion) => (
          <li key={criterion.key} className={cx('evaluation-mini__criterion')}>
            <CriterionScore
              criterion={criterion}
              headingClassName={cx('evaluation-mini__criterion-heading')}
            />
          </li>
        ))}
      </ul>
      <div className={cx('evaluation-mini__meta')}>
        {data?.cost?.approxTotal !== undefined && <CostLabel amount={data.cost.approxTotal} />}
        <AiIterationLink iteration={iteration} />
      </div>
    </div>
  ) : null;

  const content = renderEvaluationContent({
    children: evaluationContent,
    className: cx('evaluation-mini__state'),
    state: { isLoading, isError, reload },
    retryAutomationId: 'retry-ai-evaluation-mini',
  });

  return (
    <CollapsibleSection
      title={formatMessage(messages.title)}
      defaultMessage={formatMessage(messages.empty)}
      isInitiallyExpanded={Boolean(evaluation) || isLoading || isError}
    >
      {content}
    </CollapsibleSection>
  );
};
