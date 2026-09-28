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
import { StageStatusDot, StageStatusLabel } from 'pages/inside/aiFactory/common';
import { StageKey, StageRS } from 'types/aiFactory';

import { CaseLink } from './caseLink';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

export interface AutomationPerCasePanelProps {
  stage: StageRS;
}

export const AutomationPerCasePanel = ({ stage }: AutomationPerCasePanelProps) => {
  const { formatMessage } = useIntl();

  if (!stage.perCase?.length) {
    return null;
  }

  return (
    <div className={cx('panel')} data-automation-id="automationPerCasePanel">
      {stage.key === StageKey.PREPARE && <p className={cx('note')}>{formatMessage(messages.automationPrepareNote)}</p>}
      <table className={cx('table')}>
        <thead>
          <tr>
            <th>{formatMessage(messages.gradeColumnCase)}</th>
            <th>{formatMessage(messages.fixRoundsColumnStatus)}</th>
            <th>{formatMessage(messages.automationColumnResult)}</th>
          </tr>
        </thead>
        <tbody>
          {stage.perCase.map((c) => (
            <tr key={c.testCaseId}>
              <td>
                <CaseLink testCaseId={c.testCaseId} name={c.name} />
              </td>
              <td>
                <StageStatusDot status={c.status} /> <StageStatusLabel status={c.status} />
              </td>
              <td>{c.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
