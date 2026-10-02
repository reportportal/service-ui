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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { ArrowDownIcon, Button, InfoIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { AbsRelTime } from 'components/main/absRelTime';
import { CollapsibleSectionWithHeaderControl } from 'components/collapsibleSection';
import { ScoreChip } from 'pages/inside/aiFactory/common';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import { EvaluationState } from 'types/aiFactory';
import type { GradeCriterionRS } from 'types/aiFactory';

import { CriterionScore, renderEvaluationContent } from './evaluationShared';
import { normalizeCriteria } from './evaluationUtils';
import { messages } from './messages';
import { useRubricModal } from './useRubricModal';

import styles from './evaluationPanel.scss';

const cx = createClassnames(styles);

interface CriterionRowProps {
  criterion: GradeCriterionRS;
  isExpanded: boolean;
  onToggle: () => void;
}

const CriterionRow = ({ criterion, isExpanded, onToggle }: CriterionRowProps) => {
  const { formatMessage } = useIntl();
  const reasons = criterion.failureReasons.filter((reason) => typeof reason === 'string' && reason);
  const canExpand = criterion.score < criterion.maxScore && reasons.length > 0;

  return (
    <li className={cx('evaluation__criterion')}>
      <CriterionScore
        criterion={criterion}
        headingClassName={cx('evaluation__criterion-heading')}
      />
      {canExpand && (
        <>
          <button
            type="button"
            className={cx('evaluation__reasons-toggle')}
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            <ArrowDownIcon className={cx('evaluation__reasons-icon', { expanded: isExpanded })} />
            {formatMessage(messages.reasons, { count: reasons.length })}
          </button>
          {isExpanded && (
            <ul className={cx('evaluation__reasons')}>
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
};

export interface EvaluationPanelProps {
  aiDetailsState: TestCaseAiLoadState;
}

export const EvaluationPanel = ({ aiDetailsState }: EvaluationPanelProps) => {
  const { formatMessage } = useIntl();
  const { openModal: openRubricModal } = useRubricModal();
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, reload } = aiDetailsState;
  const evaluation = data?.evaluation;
  const criteria = normalizeCriteria(evaluation?.criteria);

  const toggleCriterion = (key: string) => {
    setExpandedCriteria((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const evaluationContent = evaluation ? (
    <div className={cx('evaluation')} data-automation-id="aiEvaluationPanel">
      <div className={cx('evaluation__total')}>
        <span>{formatMessage(messages.totalScore)}</span>
        <ScoreChip
          score={evaluation.totalScore}
          obsolete={evaluation.state === EvaluationState.OBSOLETE}
        />
      </div>
      <ul className={cx('evaluation__criteria')}>
        {criteria.map((criterion) => (
          <CriterionRow
            key={criterion.key}
            criterion={criterion}
            isExpanded={expandedCriteria.has(criterion.key)}
            onToggle={() => toggleCriterion(criterion.key)}
          />
        ))}
      </ul>
      <div className={cx('evaluation__meta')}>
        <span>{formatMessage(messages.evaluated)}</span>
        <span aria-hidden="true">·</span>
        <span>
          {formatMessage(messages.iteration, { number: evaluation.source.iterationNumber })}
        </span>
        {evaluation.source.fixRound !== undefined && (
          <>
            <span aria-hidden="true">·</span>
            <span>{formatMessage(messages.fixRound, { number: evaluation.source.fixRound })}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <AbsRelTime startTime={evaluation.evaluatedAt} />
      </div>
      {evaluation.state === EvaluationState.OBSOLETE && (
        <p className={cx('evaluation__obsolete')}>{formatMessage(messages.obsolete)}</p>
      )}
    </div>
  ) : null;

  const content = renderEvaluationContent({
    children: evaluationContent,
    className: cx('evaluation__state'),
    state: { isLoading, isError, reload },
    retryAutomationId: 'retry-ai-evaluation',
  });

  const rubricButton = evaluation ? (
    <Button
      variant="text"
      adjustWidthOn="content"
      icon={<InfoIcon />}
      aria-label={formatMessage(messages.rubricHelp)}
      onClick={() =>
        openRubricModal({
          criteria: criteria.map(({ key, maxScore }) => ({ key, maxScore })),
        })
      }
      className={cx('evaluation__help')}
    />
  ) : undefined;

  return (
    <CollapsibleSectionWithHeaderControl
      title={formatMessage(messages.title)}
      defaultMessage={formatMessage(messages.empty)}
      headerControlComponent={rubricButton}
      isInitiallyExpanded={Boolean(evaluation) || isLoading || isError}
    >
      {content}
    </CollapsibleSectionWithHeaderControl>
  );
};
