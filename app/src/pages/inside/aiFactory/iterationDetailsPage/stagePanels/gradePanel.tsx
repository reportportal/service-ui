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

import { Fragment, useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';
import { ArrowDownIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { ScoreBar } from 'pages/inside/aiFactory/common';
import { AiCriterionKey, CriterionKey, StageRS } from 'types/aiFactory';

import { CaseLink } from './caseLink';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

const CRITERION_MESSAGE: Record<AiCriterionKey, MessageDescriptor> = {
  [CriterionKey.ATOMICITY]: messages.criterionAtomicity,
  [CriterionKey.CLEAR_STEPS]: messages.criterionClearSteps,
  [CriterionKey.EXPECTED_RESULTS]: messages.criterionExpectedResults,
  [CriterionKey.NO_INVENTED_LOGIC]: messages.criterionNoInventedLogic,
  [CriterionKey.NO_INVENTED_UI]: messages.criterionNoInventedUi,
  [CriterionKey.COHERENCE]: messages.criterionCoherence,
};

export interface GradePanelProps {
  stage: StageRS;
}

export const GradePanel = ({ stage }: GradePanelProps) => {
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!stage.grade) {
    return null;
  }

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className={cx('panel')} data-automation-id="gradePanel">
      <p className={cx('note')}>{formatMessage(messages.gradeSuiteScore, { score: stage.grade.suiteScore })}</p>
      {stage.grade.error && <p className={cx('note')}>{stage.grade.error}</p>}
      <table className={cx('table')}>
        <thead>
          <tr>
            <th />
            <th>{formatMessage(messages.gradeColumnCase)}</th>
            <th>{formatMessage(messages.gradeColumnScore)}</th>
          </tr>
        </thead>
        <tbody>
          {stage.grade.cases.map((c) => {
            const rowKey = String(c.testCaseId ?? c.name);
            const isExpanded = expanded.has(rowKey);
            return (
              <Fragment key={rowKey}>
                <tr>
                  <td className={cx('expandRow')} onClick={() => toggle(rowKey)} data-automation-id={`gradeRowToggle-${rowKey}`}>
                    <ArrowDownIcon style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }} />
                  </td>
                  <td>
                    <CaseLink testCaseId={c.testCaseId} name={c.name} />
                  </td>
                  <td>{c.totalScore}</td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td />
                    <td colSpan={2}>
                      <div className={cx('criteria')}>
                        {c.criteria.map((criterion) => (
                          <div key={criterion.key} className={cx('criterionRow')}>
                            <span>{formatMessage(CRITERION_MESSAGE[criterion.key])}</span>
                            <span>{`${criterion.score}/${criterion.maxScore}`}</span>
                            <ScoreBar value={criterion.score} max={criterion.maxScore} />
                            {criterion.score < criterion.maxScore && criterion.failureReasons.length > 0 && (
                              <ul className={cx('failureReasons')}>
                                {criterion.failureReasons.map((reason) => (
                                  <li key={reason}>{reason}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
