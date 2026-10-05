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

import { Fragment, useId, useState } from 'react';
import { MessageDescriptor, useIntl } from 'react-intl';
import { ChevronDownDropdownIcon } from '@reportportal/ui-kit';

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

const CRITERION_SHORT_LABEL: Record<AiCriterionKey, string> = {
  [CriterionKey.ATOMICITY]: 'A',
  [CriterionKey.CLEAR_STEPS]: 'CS',
  [CriterionKey.EXPECTED_RESULTS]: 'CER',
  [CriterionKey.NO_INVENTED_LOGIC]: 'NIL',
  [CriterionKey.NO_INVENTED_UI]: 'NIU',
  [CriterionKey.COHERENCE]: 'C',
};

const GRADE_DETAIL_COL_SPAN = Object.values(CriterionKey).length + 2;

export interface GradePanelProps {
  stage: StageRS;
}

export const GradePanel = ({ stage }: GradePanelProps) => {
  const { formatMessage } = useIntl();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const panelId = useId();

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
      {stage.grade.error && <p className={cx('note')}>{stage.grade.error}</p>}
      <table className={cx('table', 'grade-table')}>
        <thead>
          <tr>
            <th scope="col">{formatMessage(messages.gradeColumnCase)}</th>
            {Object.values(CriterionKey).map((key) => {
              const maxScore = stage.grade?.cases[0]?.criteria.find(
                (criterion) => criterion.key === key,
              )?.maxScore;
              return (
                <th
                  key={key}
                  scope="col"
                  className={cx('scoreCell')}
                  title={formatMessage(CRITERION_MESSAGE[key])}
                >
                  {`${CRITERION_SHORT_LABEL[key]} /${maxScore ?? '—'}`}
                </th>
              );
            })}
            <th scope="col" className={cx('scoreCell')}>
              {formatMessage(messages.gradeColumnScore)} /100
            </th>
          </tr>
        </thead>
        <tbody>
          {stage.grade.cases.map((c, index) => {
            const rowKey = String(c.testCaseId ?? c.name);
            const isExpanded = expanded.has(rowKey);
            const detailsId = `${panelId}-case-${index}`;
            return (
              <Fragment key={rowKey}>
                <tr>
                  <td>
                    <div className={cx('caseCell')}>
                      <button
                        type="button"
                        className={cx('expandRow')}
                        aria-label={formatMessage(messages.gradeCaseDetails, { name: c.name })}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={() => toggle(rowKey)}
                        data-automation-id={`gradeRowToggle-${rowKey}`}
                      >
                        <ChevronDownDropdownIcon
                          aria-hidden="true"
                          className={cx('expandRow__icon', {
                            'expandRow__icon--expanded': isExpanded,
                          })}
                        />
                      </button>
                      <CaseLink testCaseId={c.testCaseId} name={c.name} />
                    </div>
                  </td>
                  {Object.values(CriterionKey).map((key) => (
                    <td key={key} className={cx('scoreCell')}>
                      {c.criteria.find((criterion) => criterion.key === key)?.score ?? '—'}
                    </td>
                  ))}
                  <td className={cx('scoreCell')}><strong>{c.totalScore}</strong></td>
                </tr>
                <tr
                  id={detailsId}
                  hidden={!isExpanded}
                  data-automation-id={`gradeRowDetails-${rowKey}`}
                >
                  <td colSpan={GRADE_DETAIL_COL_SPAN}>
                    <div className={cx('criteria')}>
                      {c.criteria.map((criterion) => (
                        <div key={criterion.key} className={cx('criterionRow')}>
                          <span>{formatMessage(CRITERION_MESSAGE[criterion.key])}</span>
                          <span>{`${criterion.score}/${criterion.maxScore}`}</span>
                          <ScoreBar value={criterion.score} max={criterion.maxScore} />
                          {criterion.score < criterion.maxScore &&
                            criterion.failureReasons.length > 0 && (
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
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <p className={cx('note')}>{formatMessage(messages.gradeLegend)}</p>
    </div>
  );
};
