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

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

import { createClassnames, formatDuration } from 'common/utils';
import { StageStatusLabel } from 'pages/inside/aiFactory/common';
import { StageRS } from 'types/aiFactory';

import { CaseLink } from './caseLink';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

export interface CreatePanelProps {
  stage: StageRS;
}

export const CreatePanel = ({ stage }: CreatePanelProps) => {
  const { formatMessage } = useIntl();

  if (!stage.create?.cases.length) {
    return null;
  }

  const footer = [
    stage.durationMs !== undefined
      ? { key: 'duration', node: formatMessage(messages.createStageDuration, { duration: formatDuration(stage.durationMs) }) }
      : undefined,
    stage.ciJob
      ? {
          key: 'ciJob',
          node: (
            <a href={stage.ciJob.url} target="_blank" rel="noreferrer">
              {formatMessage(messages.createCiJobLink)}
            </a>
          ),
        }
      : undefined,
  ].filter(Boolean) as { key: string; node: ReactNode }[];

  return (
    <>
      <table className={cx('table', 'create-table')} data-automation-id="createPanelTable">
        <thead>
          <tr>
            <th>{formatMessage(messages.createColumnName)}</th>
            <th>{formatMessage(messages.createColumnPriority)}</th>
            <th>{formatMessage(messages.createColumnStatus)}</th>
            <th>{formatMessage(messages.createColumnDuration)}</th>
          </tr>
        </thead>
        <tbody>
          {stage.create.cases.map((c) => (
            <tr key={c.testCaseId ?? c.name}>
              <td>
                <CaseLink testCaseId={c.testCaseId} name={c.name} />
              </td>
              <td>{c.priority}</td>
              <td>{c.status ? <StageStatusLabel status={c.status} /> : ''}</td>
              <td>{c.durationMs !== undefined ? formatDuration(c.durationMs) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {footer.length > 0 && (
        <p className={cx('note')}>
          {footer.map(({ key, node }, index) => (
            <span key={key}>
              {index > 0 ? ' · ' : ''}
              {node}
            </span>
          ))}
        </p>
      )}
    </>
  );
};
