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
import { SystemMessage } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { IterationRS, StageKey, StageRS, StageStatus } from 'types/aiFactory';

import { AutomationPerCasePanel } from './automationPerCasePanel';
import { CreatePanel } from './createPanel';
import { GradePanel } from './gradePanel';
import { ReviewPanel } from './reviewPanel';
import { TokenUsage } from './tokenUsage';
import { UploadPanel } from './uploadPanel';
import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

export interface StagePanelsProps {
  stage: StageRS;
  iteration: IterationRS;
}

const renderStageBody = (stage: StageRS, iteration: IterationRS) => {
  switch (stage.key) {
    case StageKey.CREATE:
      return <CreatePanel stage={stage} />;
    case StageKey.GRADE:
      return <GradePanel stage={stage} />;
    case StageKey.UPLOAD:
      return <UploadPanel stage={stage} autoReadyPromotedCount={iteration.autoReadyPromotedCount} />;
    case StageKey.REVIEW:
      return <ReviewPanel stage={stage} />;
    default:
      return <AutomationPerCasePanel stage={stage} />;
  }
};

export const StagePanels = ({ stage, iteration }: StagePanelsProps) => {
  const { formatMessage } = useIntl();

  const body = renderStageBody(stage, iteration);

  return (
    <div className={cx('stage-panels')} data-automation-id="stagePanels">
      {stage.status === StageStatus.FAILED && stage.failureReason && (
        <SystemMessage mode="error">{stage.failureReason}</SystemMessage>
      )}
      {stage.status === StageStatus.PENDING && (
        <p className={cx('placeholder')}>{formatMessage(messages.stageNotStarted)}</p>
      )}
      {stage.status === StageStatus.RUNNING && !body && <SpinningPreloader />}
      {stage.status === StageStatus.SKIPPED && (
        <p className={cx('placeholder')}>{formatMessage(messages.stageSkipped)}</p>
      )}
      {body}
      <TokenUsage tokens={stage.tokens} />
    </div>
  );
};
