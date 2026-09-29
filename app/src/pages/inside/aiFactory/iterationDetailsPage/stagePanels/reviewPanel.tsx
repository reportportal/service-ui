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

import { MessageDescriptor, useIntl } from 'react-intl';

import { createClassnames, formatCost } from 'common/utils';
import { LifecycleBadge } from 'pages/inside/aiFactory/common';
import { AiFixRoundStatus, EvaluationState, FixRoundStatus, ReviewCaseSummaryRS, StageRS } from 'types/aiFactory';

import { CaseLink } from './caseLink';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

const FIX_ROUND_STATUS_MESSAGE: Record<AiFixRoundStatus, MessageDescriptor> = {
  [FixRoundStatus.RUNNING]: messages.fixRoundStatusRunning,
  [FixRoundStatus.PASSED]: messages.fixRoundStatusPassed,
  [FixRoundStatus.GRADE_FAILED]: messages.fixRoundStatusGradeFailed,
  [FixRoundStatus.FAILED]: messages.fixRoundStatusFailed,
};

export interface ReviewPanelProps {
  stage: StageRS;
}

const evaluationCellMessage = (c: ReviewCaseSummaryRS) => {
  if (c.fixRunning) {
    return messages.reviewFixRunning;
  }
  if (!c.evaluationState) {
    return undefined;
  }
  return c.evaluationState === EvaluationState.OBSOLETE
    ? messages.reviewEvaluationObsolete
    : messages.reviewEvaluationEvaluated;
};

export const ReviewPanel = ({ stage }: ReviewPanelProps) => {
  const { formatMessage } = useIntl();

  if (!stage.review) {
    return null;
  }

  const { cases, fixRounds } = stage.review;

  return (
    <div className={cx('panel')} data-automation-id="reviewPanel">
      <table className={cx('table')}>
        <thead>
          <tr>
            <th>{formatMessage(messages.gradeColumnCase)}</th>
            <th>{formatMessage(messages.reviewColumnLifecycle)}</th>
            <th>{formatMessage(messages.reviewColumnMadeReadyBy)}</th>
            <th>{formatMessage(messages.reviewColumnUnsentComments)}</th>
            <th>{formatMessage(messages.gradeColumnScore)}</th>
            <th>{formatMessage(messages.reviewColumnEvaluation)}</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const evaluationMessage = evaluationCellMessage(c);
            return (
              <tr key={c.testCaseId}>
                <td>
                  <CaseLink testCaseId={c.testCaseId} name={c.name} />
                </td>
                <td>
                  <LifecycleBadge lifecycle={c.lifecycle} />
                </td>
                <td>{c.madeReadyBy ?? ''}</td>
                <td>{c.unsentComments}</td>
                <td>{c.currentScore ?? ''}</td>
                <td>{evaluationMessage ? formatMessage(evaluationMessage) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className={cx('note')}>{formatMessage(messages.fixRoundsTitle)}</p>
      {fixRounds.length === 0 ? (
        <p className={cx('placeholder')}>{formatMessage(messages.noFixRounds)}</p>
      ) : (
        <table className={cx('table')}>
          <thead>
            <tr>
              <th>{formatMessage(messages.gradeColumnCase)}</th>
              <th>{formatMessage(messages.fixRoundsColumnRound)}</th>
              <th>{formatMessage(messages.fixRoundsColumnStatus)}</th>
              <th>{formatMessage(messages.fixRoundsColumnPushedBy)}</th>
              <th>{formatMessage(messages.fixRoundsColumnScore)}</th>
              <th>{formatMessage(messages.fixRoundsColumnCost)}</th>
            </tr>
          </thead>
          <tbody>
            {fixRounds.map((round) => (
              <tr key={`${round.testCaseId}-${round.round}`}>
                <td>
                  <CaseLink testCaseId={round.testCaseId} name={round.displayId} />
                </td>
                <td>{round.round}</td>
                <td>
                  {formatMessage(FIX_ROUND_STATUS_MESSAGE[round.status])}
                  {round.failureReason ? ` — ${round.failureReason}` : ''}
                </td>
                <td>{round.pushedBy}</td>
                <td>
                  {round.scoreBefore !== undefined
                    ? formatMessage(messages.fixRoundScoreChange, {
                        before: round.scoreBefore,
                        after: round.scoreAfter ?? '…',
                      })
                    : ''}
                </td>
                <td>{round.cost !== undefined ? formatCost(round.cost) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
