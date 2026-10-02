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
import { BubblesLoader, Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { CostLabel, ScoreBar } from 'pages/inside/aiFactory/common';
import { AiIterationLink } from 'pages/inside/aiFactory/library/aiQualityCell';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import { CriterionKey } from 'types/aiFactory';
import type { AiCriterionKey, GradeCriterionRS, TestCaseAiExtension } from 'types/aiFactory';

import { CRITERION_MESSAGE } from './criterionMessages';
import { messages } from './messages';

import styles from './evaluationMini.scss';

const cx = createClassnames(styles);

const CRITERION_KEYS = new Set<string>(Object.values(CriterionKey));
const CRITERION_ORDER = new Map<AiCriterionKey, number>(
  Object.values(CriterionKey).map((criterionKey, index) => [criterionKey, index]),
);

const getCriteria = (value: unknown): GradeCriterionRS[] =>
  Array.isArray(value)
    ? value
        .filter(
          (criterion): criterion is GradeCriterionRS =>
            typeof criterion === 'object' &&
            criterion !== null &&
            CRITERION_KEYS.has((criterion as GradeCriterionRS).key) &&
            Number.isFinite((criterion as GradeCriterionRS).score) &&
            Number.isFinite((criterion as GradeCriterionRS).maxScore) &&
            Array.isArray((criterion as GradeCriterionRS).failureReasons),
        )
        .sort(
          (left, right) =>
            (CRITERION_ORDER.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
            (CRITERION_ORDER.get(right.key) ?? Number.MAX_SAFE_INTEGER),
        )
    : [];

export interface EvaluationMiniProps {
  aiDetailsState: TestCaseAiLoadState;
  iteration: NonNullable<TestCaseAiExtension['ai']>['generatedByIteration'];
}

export const EvaluationMini = ({ aiDetailsState, iteration }: EvaluationMiniProps) => {
  const { formatMessage } = useIntl();
  const { data, isLoading, isError, reload } = aiDetailsState;
  const evaluation = data?.evaluation;
  const criteria = getCriteria(evaluation?.criteria);

  let content = evaluation ? (
    <div className={cx('evaluation-mini')} data-automation-id="aiEvaluationMini">
      <ul className={cx('evaluation-mini__criteria')}>
        {criteria.map((criterion) => (
          <li key={criterion.key} className={cx('evaluation-mini__criterion')}>
            <div className={cx('evaluation-mini__criterion-heading')}>
              <span>{formatMessage(CRITERION_MESSAGE[criterion.key])}</span>
              <span>{`${criterion.score}/${criterion.maxScore}`}</span>
            </div>
            <ScoreBar value={criterion.score} max={criterion.maxScore} />
          </li>
        ))}
      </ul>
      <div className={cx('evaluation-mini__meta')}>
        {data?.cost?.approxTotal !== undefined && <CostLabel amount={data.cost.approxTotal} />}
        <AiIterationLink iteration={iteration} />
      </div>
    </div>
  ) : null;

  if (isLoading) {
    content = (
      <output className={cx('evaluation-mini__state')} aria-label={formatMessage(messages.loading)}>
        <BubblesLoader />
      </output>
    );
  } else if (isError) {
    content = (
      <div className={cx('evaluation-mini__state')} role="alert">
        <span>{formatMessage(messages.loadError)}</span>
        <Button
          variant="text"
          adjustWidthOn="content"
          onClick={reload}
          data-automation-id="retry-ai-evaluation-mini"
        >
          {formatMessage(messages.retry)}
        </Button>
      </div>
    );
  }

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
