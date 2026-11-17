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

import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import type {
  ReducedPipelineDetailStage,
  ReducedPipelineIterationDetail,
} from 'controllers/aiFactory/pipelines';

import { GenerationReviewTraceChooser } from 'pages/inside/aiFactory/iterationDetailsPage/generationReviewTraceChooser/generationReviewTraceChooser';
import { StageTraceAction } from 'pages/inside/aiFactory/iterationDetailsPage/stageTraceAction/stageTraceAction';
import styles from 'pages/inside/aiFactory/iterationDetailsPage/iterationDetailsPage.scss';

const cx = createClassnames(styles);

export interface IterationStageTraceEntryProps {
  iteration: ReducedPipelineIterationDetail;
  stage?: ReducedPipelineDetailStage;
  projectKey?: string;
  linkedCaseIds: string[];
}

export const isReviewStage = (stage?: ReducedPipelineDetailStage): boolean =>
  Boolean(
    stage &&
    (stage.stageKey?.toLowerCase() === 'review' ||
      (stage.ownedBy === 'REPORTPORTAL' && stage.attributes?.some(({ key }) => key === 'ready'))),
  );

export const getLinkedCaseIds = (stages: ReducedPipelineDetailStage[]): string[] => [
  ...new Set(
    stages.flatMap((stage) =>
      (stage.relatedEntities ?? [])
        .filter(({ entityType, entityId }) => entityType === 'TEST_CASE' && entityId.length <= 128)
        .map(({ entityId }) => entityId),
    ),
  ),
];

const isHumanGenerationReview = (
  stage: ReducedPipelineDetailStage,
  pipelineType: ReducedPipelineIterationDetail['pipelineType'],
): boolean =>
  isReviewStage(stage) &&
  stage.ownedBy === 'REPORTPORTAL' &&
  (!pipelineType || pipelineType === 'TEST_CASE_GENERATION');

export const IterationStageTraceEntry = ({
  iteration,
  stage,
  projectKey,
  linkedCaseIds,
}: IterationStageTraceEntryProps) => {
  const isEnabled = useAiFactoryEnabled();
  if (!isEnabled || !stage || !projectKey) return null;
  const context = {
    projectKey,
    pipelineId: iteration.pipelineId,
    iterationId: iteration.id,
    stageKey: stage.stageKey,
    refreshIdentity: iteration,
  };
  const isHumanReview = isHumanGenerationReview(stage, iteration.pipelineType);
  if (!isHumanReview && !stage.stageKey) return null;
  return (
    <div className={cx('stage-trace-entry')}>
      {isHumanReview ? (
        <GenerationReviewTraceChooser {...context} displayIds={linkedCaseIds} />
      ) : (
        <StageTraceAction {...context} stageKey={stage.stageKey} />
      )}
    </div>
  );
};
