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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  pipelinesBreadcrumb: {
    id: 'IterationDetailsPage.pipelinesBreadcrumb',
    defaultMessage: 'Pipelines',
  },
  refresh: {
    id: 'IterationDetailsPage.refresh',
    defaultMessage: 'Refresh',
  },
  compareWithPrevious: {
    id: 'IterationDetailsPage.compareWithPrevious',
    defaultMessage: 'Compare with previous',
  },
  iterationTitle: {
    id: 'IterationDetailsPage.iterationTitle',
    defaultMessage: 'Iteration #{number}',
  },
  kpiTestCases: {
    id: 'IterationDetailsPage.kpiTestCases',
    defaultMessage: 'Test Cases',
  },
  kpiSuiteScore: {
    id: 'IterationDetailsPage.kpiSuiteScore',
    defaultMessage: 'Suite score',
  },
  kpiAutoReadyPromoted: {
    id: 'IterationDetailsPage.kpiAutoReadyPromoted',
    defaultMessage: 'Auto-Ready promoted',
  },
  kpiReadyNow: {
    id: 'IterationDetailsPage.kpiReadyNow',
    defaultMessage: 'Ready now',
  },
  kpiFixRounds: {
    id: 'IterationDetailsPage.kpiFixRounds',
    defaultMessage: 'Fix rounds',
  },
  kpiCost: {
    id: 'IterationDetailsPage.kpiCost',
    defaultMessage: 'Cost',
  },
  bannerRunning: {
    id: 'IterationDetailsPage.bannerRunning',
    defaultMessage: 'This iteration is running. The page updates automatically.',
  },
  bannerRunningStage: {
    id: 'IterationDetailsPage.bannerRunningStage',
    defaultMessage: '{stage} is running. The page updates automatically.',
  },
  bannerCompleted: {
    id: 'IterationDetailsPage.bannerCompleted',
    defaultMessage: 'All Test Cases of this iteration are Ready',
  },
  bannerInReview: {
    id: 'IterationDetailsPage.bannerInReview',
    defaultMessage:
      '{count} {count, plural, one {Draft Test Case waits} other {Draft Test Cases wait}} for review',
  },
  openReviewQueue: {
    id: 'IterationDetailsPage.openReviewQueue',
    defaultMessage: 'Open review queue',
  },
  bannerFailedGeneric: {
    id: 'IterationDetailsPage.bannerFailedGeneric',
    defaultMessage: 'A stage failed — see the stage panel',
  },
  stageNotStarted: {
    id: 'IterationDetailsPage.stageNotStarted',
    defaultMessage: "This stage hasn't started yet",
  },
  stageRunning: {
    id: 'IterationDetailsPage.stageRunning',
    defaultMessage: 'This stage is running…',
  },
  stageSkipped: {
    id: 'IterationDetailsPage.stageSkipped',
    defaultMessage: 'This stage was skipped',
  },
  createColumnName: {
    id: 'IterationDetailsPage.createColumnName',
    defaultMessage: 'Name',
  },
  createColumnPriority: {
    id: 'IterationDetailsPage.createColumnPriority',
    defaultMessage: 'Priority',
  },
  createColumnStatus: {
    id: 'IterationDetailsPage.createColumnStatus',
    defaultMessage: 'Status',
  },
  createColumnDuration: {
    id: 'IterationDetailsPage.createColumnDuration',
    defaultMessage: 'Duration',
  },
  createCiJobLink: {
    id: 'IterationDetailsPage.createCiJobLink',
    defaultMessage: 'CI job',
  },
  createStageDuration: {
    id: 'IterationDetailsPage.createStageDuration',
    defaultMessage: 'Duration: {duration}',
  },
  gradeSuiteScore: {
    id: 'IterationDetailsPage.gradeSuiteScore',
    defaultMessage: 'Suite score {score}',
  },
  gradeColumnCase: {
    id: 'IterationDetailsPage.gradeColumnCase',
    defaultMessage: 'Case',
  },
  gradeColumnScore: {
    id: 'IterationDetailsPage.gradeColumnScore',
    defaultMessage: 'Score',
  },
  gradeNoFailureReasons: {
    id: 'IterationDetailsPage.gradeNoFailureReasons',
    defaultMessage: 'At max score — nothing to explain',
  },
  criterionAtomicity: {
    id: 'IterationDetailsPage.criterionAtomicity',
    defaultMessage: 'Atomicity',
  },
  criterionClearSteps: {
    id: 'IterationDetailsPage.criterionClearSteps',
    defaultMessage: 'Clear steps',
  },
  criterionExpectedResults: {
    id: 'IterationDetailsPage.criterionExpectedResults',
    defaultMessage: 'Clear expected results',
  },
  criterionNoInventedLogic: {
    id: 'IterationDetailsPage.criterionNoInventedLogic',
    defaultMessage: 'No invented logic',
  },
  criterionNoInventedUi: {
    id: 'IterationDetailsPage.criterionNoInventedUi',
    defaultMessage: 'No invented UI',
  },
  criterionCoherence: {
    id: 'IterationDetailsPage.criterionCoherence',
    defaultMessage: 'Coherence',
  },
  uploadColumnResult: {
    id: 'IterationDetailsPage.uploadColumnResult',
    defaultMessage: 'Result',
  },
  uploadResultCreatedDraft: {
    id: 'IterationDetailsPage.uploadResultCreatedDraft',
    defaultMessage: 'Created · Draft',
  },
  uploadResultCreatedReadyAuto: {
    id: 'IterationDetailsPage.uploadResultCreatedReadyAuto',
    defaultMessage: 'Created · Ready (Auto-Ready)',
  },
  uploadResultFailed: {
    id: 'IterationDetailsPage.uploadResultFailed',
    defaultMessage: 'Failed',
  },
  uploadAutoReadyPromoted: {
    id: 'IterationDetailsPage.uploadAutoReadyPromoted',
    defaultMessage: 'Auto-Ready: {promoted} of {total} promoted (threshold {threshold})',
  },
  reviewColumnLifecycle: {
    id: 'IterationDetailsPage.reviewColumnLifecycle',
    defaultMessage: 'Lifecycle',
  },
  reviewColumnMadeReadyBy: {
    id: 'IterationDetailsPage.reviewColumnMadeReadyBy',
    defaultMessage: 'Made Ready by',
  },
  reviewColumnUnsentComments: {
    id: 'IterationDetailsPage.reviewColumnUnsentComments',
    defaultMessage: 'Unsent comments',
  },
  reviewColumnEvaluation: {
    id: 'IterationDetailsPage.reviewColumnEvaluation',
    defaultMessage: 'Evaluation',
  },
  reviewEvaluationObsolete: {
    id: 'IterationDetailsPage.reviewEvaluationObsolete',
    defaultMessage: 'Obsolete',
  },
  reviewEvaluationEvaluated: {
    id: 'IterationDetailsPage.reviewEvaluationEvaluated',
    defaultMessage: 'Evaluated',
  },
  reviewFixRunning: {
    id: 'IterationDetailsPage.reviewFixRunning',
    defaultMessage: 'Agent is fixing…',
  },
  fixRoundsTitle: {
    id: 'IterationDetailsPage.fixRoundsTitle',
    defaultMessage: 'Fix rounds',
  },
  fixRoundsColumnRound: {
    id: 'IterationDetailsPage.fixRoundsColumnRound',
    defaultMessage: 'Fix round',
  },
  fixRoundsColumnStatus: {
    id: 'IterationDetailsPage.fixRoundsColumnStatus',
    defaultMessage: 'Status',
  },
  fixRoundsColumnPushedBy: {
    id: 'IterationDetailsPage.fixRoundsColumnPushedBy',
    defaultMessage: 'Pushed by',
  },
  fixRoundsColumnScore: {
    id: 'IterationDetailsPage.fixRoundsColumnScore',
    defaultMessage: 'Score',
  },
  fixRoundsColumnCost: {
    id: 'IterationDetailsPage.fixRoundsColumnCost',
    defaultMessage: 'Cost',
  },
  fixRoundScoreChange: {
    id: 'IterationDetailsPage.fixRoundScoreChange',
    defaultMessage: '{before} → {after}',
  },
  fixRoundStatusRunning: {
    id: 'IterationDetailsPage.fixRoundStatusRunning',
    defaultMessage: 'Running',
  },
  fixRoundStatusPassed: {
    id: 'IterationDetailsPage.fixRoundStatusPassed',
    defaultMessage: 'Fix ✓ · Grade ✓ · Updated',
  },
  fixRoundStatusAutoReady: {
    id: 'IterationDetailsPage.fixRoundStatusAutoReady',
    defaultMessage: 'Auto-Ready',
  },
  fixRoundStatusGradeFailed: {
    id: 'IterationDetailsPage.fixRoundStatusGradeFailed',
    defaultMessage: 'Fixed · Grade failed',
  },
  fixRoundStatusFailed: {
    id: 'IterationDetailsPage.fixRoundStatusFailed',
    defaultMessage: 'Failed',
  },
  noFixRounds: {
    id: 'IterationDetailsPage.noFixRounds',
    defaultMessage: 'No fix rounds yet',
  },
  automationColumnResult: {
    id: 'IterationDetailsPage.automationColumnResult',
    defaultMessage: 'Result',
  },
  automationPrepareNote: {
    id: 'IterationDetailsPage.automationPrepareNote',
    defaultMessage: 'Source: Test Case Library (not Jira)',
  },
  tokenUsageTitle: {
    id: 'IterationDetailsPage.tokenUsageTitle',
    defaultMessage: 'Token usage',
  },
  tokenUsageLine: {
    id: 'IterationDetailsPage.tokenUsageLine',
    defaultMessage:
      '{model}: {input} in · {cacheRead} cache read · {cacheWrite} cache write · {output} out · {cost}',
  },
});
