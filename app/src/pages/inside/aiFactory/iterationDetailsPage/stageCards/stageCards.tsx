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
  STAGE_LABEL_MESSAGE,
  StageStatusDot,
  StageStatusLabel,
  stageMetric,
} from 'pages/inside/aiFactory/common';
import { AiStageKey, StageRS } from 'types/aiFactory';

import styles from './stageCards.scss';

const cx = createClassnames(styles);

export interface StageCardsProps {
  stages: StageRS[];
  testCasesCount: number;
  selectedStage: AiStageKey;
  onSelect: (stage: AiStageKey) => void;
}

export const StageCards = ({
  stages,
  testCasesCount,
  selectedStage,
  onSelect,
}: StageCardsProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('stage-cards')} data-automation-id="stageCards">
      {stages.map((stage, index) => {
        const metric = stageMetric(stage, testCasesCount);
        let metricLabel: string | null = null;
        if (metric?.kind === 'cases') {
          metricLabel = String(metric.count);
        } else if (metric?.kind === 'score') {
          metricLabel = String(metric.score);
        } else if (metric?.kind === 'ready') {
          metricLabel = `${metric.ready}/${metric.total}`;
        }

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
              </div>
              <StageStatusLabel status={stage.status} />
              {metricLabel && <span className={cx('stage-cards__item-metric')}>{metricLabel}</span>}
            </button>
          </div>
        );
      })}
    </div>
  );
};
