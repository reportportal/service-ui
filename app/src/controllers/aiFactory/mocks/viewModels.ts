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

/**
 * Projects `db.ts` internal records into the public contract DTOs (`types/aiFactory.ts`).
 * Handlers call these; nothing else should build a response shape by hand.
 */

import {
  AutomationStatus,
  MergeRequestState,
  StageKey,
  TestCaseAiExtension,
  TestCaseAiRS,
} from 'types/aiFactory';
import { findIteration } from 'controllers/aiFactory/mocks/db';
import { caseCost, caseShare, totalScore, unsentCommentsCount } from 'controllers/aiFactory/mocks/engine';
import { MockCaseRecord, MockIterationSeed, MockPipelineSeed } from 'controllers/aiFactory/mocks/types';

export const toTestCaseAiExtension = (
  c: MockCaseRecord,
  pipeline?: MockPipelineSeed,
  iteration?: MockIterationSeed,
): TestCaseAiExtension => ({
  lifecycle: c.lifecycle,
  ai:
    c.ai && iteration
      ? {
          generatedByIteration: {
            pipelineId: iteration.pipelineId,
            iterationId: iteration.id,
            number: iteration.number,
          },
          modifiedByAgent: c.ai.modifiedByAgent,
          factoryKey: c.ai.factoryKey,
        }
      : undefined,
  evaluationSummary: c.evaluation && { totalScore: totalScore(c) || 0, state: c.evaluation.state },
  costSummary: c.ai && iteration ? { approxTotal: caseCost(c, iteration) } : undefined,
  review: {
    unsentCommentsCount: unsentCommentsCount(c),
    fixRound: c.fixRoundRunning
      ? { number: c.fixRoundRunning.round, status: 'RUNNING' }
      : undefined,
  },
  automation: c.automation && { status: c.automation.status },
  blockedPlans: undefined, // filled by the caller, which has the plan list (db.plansBlockedByCase)
});

export const toTestCaseAiRS = (
  c: MockCaseRecord,
  pipeline?: MockPipelineSeed,
  iteration?: MockIterationSeed,
): TestCaseAiRS => ({
  evaluation:
    c.evaluation && iteration
      ? {
          totalScore: totalScore(c) || 0,
          state: c.evaluation.state,
          source: {
            iterationId: iteration.id,
            iterationNumber: iteration.number,
            fixRound: c.evaluation.sourceFixRound,
          },
          evaluatedAt: c.evaluation.evaluatedAt,
          criteria: c.evaluation.criteria,
        }
      : undefined,
  cost:
    c.ai && iteration
      ? (() => {
          const share = caseShare(c, iteration);
          return {
            approxTotal: caseCost(c, iteration),
            iterationShare: {
              iterationNumber: iteration.number,
              amount: share.amount,
              iterationBaseCost: share.amount * share.casesCount,
              casesCount: share.casesCount,
            },
            fixRounds: c.fixRounds.map((r) => ({ round: r.round, amount: r.cost || 0 })),
            tokens: share.tokens,
            model: iteration.model,
          };
        })()
      : undefined,
  pipelineLinks: iteration
    ? [
        {
          pipelineId: iteration.pipelineId,
          pipelineName: pipeline?.name,
          iterationId: iteration.id,
          iterationNumber: iteration.number,
          requirementId: iteration.requirement?.specId,
          stage: StageKey.GRADE,
        },
        ...c.fixRounds.map((r) => ({
          pipelineId: iteration.pipelineId,
          pipelineName: pipeline?.name,
          iterationId: iteration.id,
          iterationNumber: iteration.number,
          requirementId: iteration.requirement?.specId,
          stage: StageKey.REVIEW,
          fixRound: r.round,
        })),
      ]
    : [],
  lastAgentChange: c.lastAgentChange,
  automation: toAutomationRS(c),
  lifecycleHistory: c.lifecycleHistory,
});

const toAutomationRS = (c: MockCaseRecord): TestCaseAiRS['automation'] => {
  if (!c.automation) return undefined;
  const automationIteration = c.automation.iterationId
    ? findIteration(c.automation.iterationId)
    : undefined;
  return {
    status: c.automation.status,
    iteration: automationIteration
      ? {
          pipelineId: automationIteration.pipelineId,
          iterationId: automationIteration.id,
          number: automationIteration.number,
        }
      : undefined,
    launch: c.automation.launch,
    mergeRequest: automationIteration?.mergeRequest
      ? {
          id: automationIteration.mergeRequest.id,
          state:
            automationIteration.mergeRequest.state ??
            (c.automation.status === AutomationStatus.FAILED
              ? MergeRequestState.CLOSED
              : MergeRequestState.OPEN),
        }
      : undefined,
    lastResult: c.automation.lastResult,
    scenarioChangedAfterAutomation: c.automation.scenarioChangedAfterAutomation,
  };
};
