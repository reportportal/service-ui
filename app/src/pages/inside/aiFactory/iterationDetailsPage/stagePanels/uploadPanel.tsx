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
import { Button, RerunIcon, SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { StageStatusLabel } from 'pages/inside/aiFactory/common';
import { AiUploadResult, IterationRS, StageRS, StageStatus, UploadResult } from 'types/aiFactory';

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
  iterationNumber: IterationRS['number'];
}

export const UploadPanel = ({
  stage,
  autoReadyPromotedCount,
  iterationNumber,
}: UploadPanelProps) => {
  const { formatMessage } = useIntl();

  if (stage.status === StageStatus.FAILED) {
    return (
      <div className={cx('panel', 'failed-upload')} data-automation-id="failedUploadPanel">
        {stage.failureReason && (
          <SystemMessage mode="warning">
            {formatMessage(messages.uploadRollbackWarning, { reason: stage.failureReason })}
          </SystemMessage>
        )}
        <table className={cx('table', 'attempt-table')}>
          <thead>
            <tr>
              <th>{formatMessage(messages.uploadAttempt)}</th>
              <th>{formatMessage(messages.uploadAttemptStatus)}</th>
              <th>{formatMessage(messages.uploadAttemptCiJob)}</th>
              <th>{formatMessage(messages.uploadAttemptReason)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{formatMessage(messages.uploadAttemptNumber, { number: 1 })}</td>
              <td><StageStatusLabel status={stage.status} /></td>
              <td>
                {stage.ciJob ? (
                  <a href={stage.ciJob.url} target="_blank" rel="noreferrer">
                    {stage.ciJob.id}
                  </a>
                ) : '—'}
              </td>
              <td>{stage.failureReason ?? '—'}</td>
            </tr>
          </tbody>
        </table>
        <div className={cx('retry-row')}>
          <Button
            variant="primary"
            adjustWidthOn="content"
            icon={<RerunIcon />}
            disabled
            title={formatMessage(messages.retryStageUnavailable)}
            data-automation-id="retryUploadButton"
          >
            {formatMessage(messages.retryUpload)}
          </Button>
          <span>{formatMessage(messages.retryUploadDescription, { number: iterationNumber })}</span>
        </div>
      </div>
    );
  }

  if (!stage.upload || stage.status !== StageStatus.PASSED) {
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
