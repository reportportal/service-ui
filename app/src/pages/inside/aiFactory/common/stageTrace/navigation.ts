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

import { PROJECT_PIPELINE_STAGE_TRACE_PAGE } from 'controllers/pages';

interface StageTraceContext {
  organizationSlug: string;
  projectSlug: string;
}

export interface StageTraceTarget {
  pipelineId: number;
  iterationId: number;
  stageKey: string;
}

interface StageTraceNavigationOptions {
  returnTo?: Omit<StageTraceTarget, 'stageKey'> & { stageKey?: string };
  fixRoundNumber?: number;
}

export const createStageTraceAction = (
  context: StageTraceContext,
  target: StageTraceTarget,
  { returnTo, fixRoundNumber }: StageTraceNavigationOptions = {},
) => ({
  type: PROJECT_PIPELINE_STAGE_TRACE_PAGE,
  payload: { ...context, ...target },
  query: {
    ...(fixRoundNumber !== undefined ? { fixRoundNumber: String(fixRoundNumber) } : {}),
    ...(returnTo
      ? {
          returnPipelineId: String(returnTo.pipelineId),
          returnIterationId: String(returnTo.iterationId),
          ...(returnTo.stageKey ? { returnStageKey: returnTo.stageKey } : {}),
        }
      : {}),
  },
});
