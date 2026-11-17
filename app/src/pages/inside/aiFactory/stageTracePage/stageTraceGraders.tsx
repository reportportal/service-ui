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
import {
  getCriterionRows,
  type TraceGraderData,
} from 'pages/inside/aiFactory/stageTracePage/stageTraceGraderUtils';
import { messages } from 'pages/inside/aiFactory/stageTracePage/messages';
import styles from 'pages/inside/aiFactory/stageTracePage/stageTracePage.scss';

interface StageTraceGradersProps {
  data: TraceGraderData;
}
const cx = createClassnames(styles);
export const StageTraceGraders = ({ data }: StageTraceGradersProps) => {
  const { formatMessage } = useIntl();
  const hasComparison = data.before !== undefined && data.after !== undefined;
  return (
    <section className={cx('graders')} aria-label={formatMessage(messages.graderScores)}>
      <h3>{formatMessage(messages.graderScores)}</h3>
      <dl className={cx('graders__fields')}>
        {data.caseId !== undefined && (
          <>
            <dt>{formatMessage(messages.graderCase)}</dt>
            <dd>{data.caseId}</dd>
          </>
        )}
        {data.total !== undefined && (
          <>
            <dt>{formatMessage(messages.graderTotal)}</dt>
            <dd>{data.total} / 100</dd>
          </>
        )}
        {hasComparison && (
          <>
            <dt>{formatMessage(messages.graderChange)}</dt>
            <dd>
              {data.before} → {data.after} / 100
            </dd>
          </>
        )}
        {!hasComparison && data.before !== undefined && (
          <>
            <dt>{formatMessage(messages.graderBefore)}</dt>
            <dd>{data.before} / 100</dd>
          </>
        )}
        {!hasComparison && data.after !== undefined && (
          <>
            <dt>{formatMessage(messages.graderAfter)}</dt>
            <dd>{data.after} / 100</dd>
          </>
        )}
      </dl>
      {Boolean(data.criteria?.length) && (
        <table className={cx('graders__criteria')}>
          <thead>
            <tr>
              <th scope="col">{formatMessage(messages.graderCriterion)}</th>
              <th scope="col">{formatMessage(messages.graderScore)}</th>
            </tr>
          </thead>
          <tbody>
            {getCriterionRows(data.criteria).map((criterion) => (
              <tr key={criterion.key}>
                <th scope="row">{criterion.name}</th>
                <td>
                  {criterion.score} / {criterion.max}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};
