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

import { type IntlShape, useIntl } from 'react-intl';
import { RerunIcon } from '@reportportal/ui-kit';

import { createClassnames, formatCost, formatDuration } from 'common/utils';
import {
  ScoreBar,
  STAGE_LABEL_MESSAGE,
  StageStatusDot,
  StageStatusLabel,
} from 'pages/inside/aiFactory/common';
import { AiStageKey, StageKey, StageRS, StageStatus } from 'types/aiFactory';

import { messages } from '../messages';
import styles from './stageCards.scss';

const cx = createClassnames(styles);

type FormatMessage = IntlShape['formatMessage'];

interface StageCardCopyOptions {
  stage: StageRS;
  testCasesCount: number;
  readyCount: number;
  fixRoundsCount: number;
  autoReadyPromotedCount: number;
  formatMessage: FormatMessage;
}

interface StageCardCopy {
  summary: string;
  description: string | null;
}

const getCreateStageCopy = ({
  testCasesCount,
  formatMessage,
}: StageCardCopyOptions): StageCardCopy => ({
  summary: formatMessage(messages.stageCasesCreated, { count: testCasesCount }),
  description: formatMessage(messages.stageCreateDescription),
});

const getGradeStageCopy = ({
  stage,
  testCasesCount,
  formatMessage,
}: StageCardCopyOptions): StageCardCopy => ({
  summary: formatMessage(
    stage.status === StageStatus.RUNNING ? messages.stageGrading : messages.stageCasesGraded,
    { count: testCasesCount },
  ),
  description: null,
});

const getUploadStageCopy = ({
  stage,
  testCasesCount,
  autoReadyPromotedCount,
  formatMessage,
}: StageCardCopyOptions): StageCardCopy => ({
  summary: formatMessage(
    stage.status === StageStatus.PENDING
      ? messages.stageWaitingForGrade
      : messages.stageCasesUploaded,
    { count: testCasesCount },
  ),
  description:
    stage.status === StageStatus.PASSED
      ? formatMessage(messages.stageAutoReady, { count: autoReadyPromotedCount })
      : null,
});

const getReviewStageCopy = ({
  stage,
  testCasesCount,
  readyCount,
  fixRoundsCount,
  formatMessage,
}: StageCardCopyOptions): StageCardCopy => ({
  summary: formatMessage(
    stage.status === StageStatus.PENDING ? messages.stageWaitingForUpload : messages.stageReady,
    { ready: readyCount, total: testCasesCount },
  ),
  description:
    stage.status === StageStatus.PENDING
      ? null
      : formatMessage(messages.stageFixRounds, { count: fixRoundsCount }),
});

const getStageCardCopy = (options: StageCardCopyOptions): StageCardCopy => {
  const { stage, testCasesCount, formatMessage } = options;
  if (stage.status === StageStatus.FAILED && stage.failureReason) {
    return { summary: stage.failureReason, description: null };
  }

  switch (stage.key) {
    case StageKey.CREATE:
      return getCreateStageCopy(options);
    case StageKey.GRADE:
      return getGradeStageCopy(options);
    case StageKey.UPLOAD:
      return getUploadStageCopy(options);
    case StageKey.REVIEW:
      return getReviewStageCopy(options);
    default:
      return {
        summary: formatMessage(messages.stageTestCases, { count: testCasesCount }),
        description: null,
      };
  }
};

export interface StageCardsProps {
  stages: StageRS[];
  testCasesCount: number;
  readyCount?: number;
  fixRoundsCount?: number;
  autoReadyPromotedCount?: number;
  selectedStage: AiStageKey;
  onSelect: (stage: AiStageKey) => void;
}

export const StageCards = ({
  stages,
  testCasesCount,
  readyCount = 0,
  fixRoundsCount = 0,
  autoReadyPromotedCount = 0,
  selectedStage,
  onSelect,
}: StageCardsProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('stage-cards')} data-automation-id="stageCards">
      {stages.map((stage, index) => {
        const { summary, description } = getStageCardCopy({
          stage,
          testCasesCount,
          readyCount,
          fixRoundsCount,
          autoReadyPromotedCount,
          formatMessage,
        });

        return (
          <div key={stage.key} className={cx('stage-cards__item-wrapper')}>
            {index > 0 && (
              <span className={cx('stage-cards__arrow')} aria-hidden="true">
                {'→'}
              </span>
            )}
            <button
              type="button"
              className={cx('stage-cards__item', {
                'stage-cards__item--selected': stage.key === selectedStage,
              })}
              aria-pressed={stage.key === selectedStage}
              onClick={() => onSelect(stage.key)}
              data-automation-id={`stageCard-${stage.key}`}
            >
              <div className={cx('stage-cards__item-header')}>
                <StageStatusDot status={stage.status} isDecorative />
                <span className={cx('stage-cards__item-label')}>
                  {formatMessage(STAGE_LABEL_MESSAGE[stage.key])}
                </span>
                <StageStatusLabel status={stage.status} />
              </div>
              <span
                className={cx('stage-cards__item-summary', {
                  'stage-cards__item-summary--failed': stage.status === StageStatus.FAILED,
                })}
              >
                {summary}
              </span>
              {stage.key === StageKey.GRADE && stage.grade && (
                <div className={cx('stage-cards__score')}>
                  <ScoreBar value={stage.grade.suiteScore} max={100} />
                  <strong>{stage.grade.suiteScore}</strong>
                </div>
              )}
              {stage.key === StageKey.REVIEW && stage.status !== StageStatus.PENDING && (
                <ScoreBar value={readyCount} max={testCasesCount || 1} />
              )}
              {description && (
                <span className={cx('stage-cards__item-description')}>{description}</span>
              )}
              {stage.status === StageStatus.FAILED &&
                (stage.key === StageKey.CREATE || stage.key === StageKey.UPLOAD) && (
                  <span
                    className={cx('stage-cards__retry')}
                    title={formatMessage(messages.retryStageUnavailable)}
                  >
                    <RerunIcon aria-hidden="true" />
                    {formatMessage(messages.retryStage, {
                      stage: formatMessage(STAGE_LABEL_MESSAGE[stage.key]),
                    })}
                  </span>
                )}
              <span className={cx('stage-cards__item-footer')}>
                {stage.durationMs !== undefined && formatDuration(stage.durationMs)}
                {stage.durationMs !== undefined && ' · '}
                {formatCost(stage.cost)}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
