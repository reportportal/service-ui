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

import { createClassnames } from 'common/utils';
import { AiUploadResult, IterationRS, StageRS, UploadResult } from 'types/aiFactory';

import { CaseLink } from './caseLink';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

const UPLOAD_RESULT_MESSAGE: Record<AiUploadResult, MessageDescriptor> = {
  [UploadResult.CREATED_DRAFT]: messages.uploadResultCreatedDraft,
  [UploadResult.CREATED_READY_AUTO]: messages.uploadResultCreatedReadyAuto,
  [UploadResult.FAILED]: messages.uploadResultFailed,
};

export interface UploadPanelProps {
  stage: StageRS;
  autoReadyPromotedCount?: IterationRS['autoReadyPromotedCount'];
}

export const UploadPanel = ({ stage, autoReadyPromotedCount }: UploadPanelProps) => {
  const { formatMessage } = useIntl();

  if (!stage.upload) {
    return null;
  }

  return (
    <div className={cx('panel')} data-automation-id="uploadPanel">
      <table className={cx('table')}>
        <thead>
          <tr>
            <th>{formatMessage(messages.createColumnName)}</th>
            <th>{formatMessage(messages.uploadColumnResult)}</th>
            <th>{formatMessage(messages.gradeColumnScore)}</th>
          </tr>
        </thead>
        <tbody>
          {stage.upload.results.map((result) => (
            <tr key={result.testCaseId ?? result.name}>
              <td>
                <CaseLink testCaseId={result.testCaseId} name={result.name} />
              </td>
              <td>
                {formatMessage(UPLOAD_RESULT_MESSAGE[result.result])}
                {result.result === UploadResult.FAILED && result.reason ? ` — ${result.reason}` : ''}
              </td>
              <td>{result.score ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {autoReadyPromotedCount !== undefined && (
        <p className={cx('note')}>
          {formatMessage(messages.uploadAutoReadyPromoted, {
            promoted: autoReadyPromotedCount,
            total: stage.upload.results.length,
            threshold: stage.upload.threshold,
          })}
        </p>
      )}
    </div>
  );
};
