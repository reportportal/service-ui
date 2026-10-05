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
  detailUnavailable: {
    id: 'IterationDetailsPage.detailUnavailable',
    defaultMessage: 'Iteration details are unavailable for this pipeline source',
  },
  detailLoading: {
    id: 'IterationDetailsPage.detailLoading',
    defaultMessage: 'Loading iteration details…',
  },
  detailError: {
    id: 'IterationDetailsPage.detailError',
    defaultMessage: 'Iteration details could not be loaded',
  },
  retry: {
    id: 'IterationDetailsPage.retry',
    defaultMessage: 'Retry',
  },
  liveStatusPending: {
    id: 'IterationDetailsPage.liveStatusPending',
    defaultMessage: 'Pending',
  },
  liveStatusPassed: {
    id: 'IterationDetailsPage.liveStatusPassed',
    defaultMessage: 'Passed',
  },
  liveStatusFailed: {
    id: 'IterationDetailsPage.liveStatusFailed',
    defaultMessage: 'Failed',
  },
  liveStatusNeedsHuman: {
    id: 'IterationDetailsPage.liveStatusNeedsHuman',
    defaultMessage: 'Needs human review',
  },
  liveStatusUnknown: {
    id: 'IterationDetailsPage.liveStatusUnknown',
    defaultMessage: 'Unknown',
  },
  noStages: {
    id: 'IterationDetailsPage.noStages',
    defaultMessage: 'No stages are available for this iteration',
  },
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
  rerun: {
    id: 'IterationDetailsPage.rerun',
    defaultMessage: 'Re-run',
  },
  rerunPermissionUnavailable: {
    id: 'IterationDetailsPage.rerunPermissionUnavailable',
    defaultMessage: 'Re-run is available to Organization Managers and Administrators',
  },
  iterationTitle: {
    id: 'IterationDetailsPage.iterationTitle',
    defaultMessage: 'Iteration #{number}',
  },
  iterationBadge: {
    id: 'IterationDetailsPage.iterationBadge',
    defaultMessage: 'Iteration',
  },
  summaryLabel: {
    id: 'IterationDetailsPage.summaryLabel',
    defaultMessage: 'Iteration summary',
  },
  metaRequirement: {
    id: 'IterationDetailsPage.metaRequirement',
    defaultMessage: 'Requirement',
  },
  metaTestCases: {
    id: 'IterationDetailsPage.metaTestCases',
    defaultMessage: 'Test Cases',
  },
  metaTrigger: {
    id: 'IterationDetailsPage.metaTrigger',
    defaultMessage: 'Trigger',
  },
  metaStartedBy: {
    id: 'IterationDetailsPage.metaStartedBy',
    defaultMessage: 'Started by',
  },
  metaModel: {
    id: 'IterationDetailsPage.metaModel',
    defaultMessage: 'Model',
  },
  metaEnvironment: {
    id: 'IterationDetailsPage.metaEnvironment',
    defaultMessage: 'Environment',
  },
  metaStarted: {
    id: 'IterationDetailsPage.metaStarted',
    defaultMessage: 'Started',
  },
  metaCiPipeline: {
    id: 'IterationDetailsPage.metaCiPipeline',
    defaultMessage: 'CI pipeline',
  },
  stagesTitle: {
    id: 'IterationDetailsPage.stagesTitle',
    defaultMessage: 'Stages',
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
    defaultMessage: 'Pipeline estimate',
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
  stageCasesCreated: {
    id: 'IterationDetailsPage.stageCasesCreated',
    defaultMessage: '{count} Test Cases created',
  },
  stageCreateDescription: {
    id: 'IterationDetailsPage.stageCreateDescription',
    defaultMessage: 'Self-review and self-fix included',
  },
  stageCasesGraded: {
    id: 'IterationDetailsPage.stageCasesGraded',
    defaultMessage: '{count} cases graded',
  },
  stageGrading: {
    id: 'IterationDetailsPage.stageGrading',
    defaultMessage: 'Grading Test Cases…',
  },
  stageCasesUploaded: {
    id: 'IterationDetailsPage.stageCasesUploaded',
    defaultMessage: '{count} uploaded as Draft',
  },
  stageAutoReady: {
    id: 'IterationDetailsPage.stageAutoReady',
    defaultMessage: 'Auto-Ready → Ready: {count}',
  },
  stageReady: {
    id: 'IterationDetailsPage.stageReady',
    defaultMessage: '{ready} / {total} Ready',
  },
  stageFixRounds: {
    id: 'IterationDetailsPage.stageFixRounds',
    defaultMessage: '{count} fix round(s) · in the Library',
  },
  stageWaitingForGrade: {
    id: 'IterationDetailsPage.stageWaitingForGrade',
    defaultMessage: 'Waiting for Grade',
  },
  stageWaitingForUpload: {
    id: 'IterationDetailsPage.stageWaitingForUpload',
    defaultMessage: 'Waiting for Upload',
  },
  stageTestCases: {
    id: 'IterationDetailsPage.stageTestCases',
    defaultMessage: '{count} Test Case(s)',
  },
  retryStageUnavailable: {
    id: 'IterationDetailsPage.retryStageUnavailable',
    defaultMessage: 'Retry requires the CI retry contract and a connected pipeline',
  },
  retryStage: {
    id: 'IterationDetailsPage.retryStage',
    defaultMessage: 'Retry {stage}',
  },
  uploadRollbackWarning: {
    id: 'IterationDetailsPage.uploadRollbackWarning',
    defaultMessage: '{reason}. Upload is all or nothing: the Library is unchanged.',
  },
  retryUploadDescription: {
    id: 'IterationDetailsPage.retryUploadDescription',
    defaultMessage:
      'Runs this stage again inside Iteration #{number}; the stages after it follow (US-020). A stage that passed cannot be retried.',
  },
  retryUpload: {
    id: 'IterationDetailsPage.retryUpload',
    defaultMessage: 'Retry Upload',
  },
  uploadAttempt: {
    id: 'IterationDetailsPage.uploadAttempt',
    defaultMessage: 'Attempt',
  },
  uploadAttemptNumber: {
    id: 'IterationDetailsPage.uploadAttemptNumber',
    defaultMessage: '#{number}',
  },
  uploadAttemptStatus: {
    id: 'IterationDetailsPage.uploadAttemptStatus',
    defaultMessage: 'Status',
  },
  uploadAttemptCiJob: {
    id: 'IterationDetailsPage.uploadAttemptCiJob',
    defaultMessage: 'CI job',
  },
  uploadAttemptReason: {
    id: 'IterationDetailsPage.uploadAttemptReason',
    defaultMessage: 'Reason',
  },
  stageDetailsTitle: {
    id: 'IterationDetailsPage.stageDetailsTitle',
    defaultMessage: 'Stage details',
  },
  stageDetailsStage: {
    id: 'IterationDetailsPage.stageDetailsStage',
    defaultMessage: 'Stage',
  },
  stageDetailsStatus: {
    id: 'IterationDetailsPage.stageDetailsStatus',
    defaultMessage: 'Status',
  },
  stageDetailsDuration: {
    id: 'IterationDetailsPage.stageDetailsDuration',
    defaultMessage: 'Duration',
  },
  stageDetailsCiJob: {
    id: 'IterationDetailsPage.stageDetailsCiJob',
    defaultMessage: 'CI job',
  },
  stageDetailsModel: {
    id: 'IterationDetailsPage.stageDetailsModel',
    defaultMessage: 'Model',
  },
  stageDetailsCost: {
    id: 'IterationDetailsPage.stageDetailsCost',
    defaultMessage: 'Cost',
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
  gradeSuiteScoreSummary: {
    id: 'IterationDetailsPage.gradeSuiteScoreSummary',
    defaultMessage: 'Suite score {score} / 100 (mean of cases) · evaluation only',
  },
  gradeColumnCase: {
    id: 'IterationDetailsPage.gradeColumnCase',
    defaultMessage: 'Case',
  },
  gradeCaseDetails: {
    id: 'IterationDetailsPage.gradeCaseDetails',
    defaultMessage: 'Toggle score details for {name}',
  },
  gradeColumnScore: {
    id: 'IterationDetailsPage.gradeColumnScore',
    defaultMessage: 'Score',
  },
  gradeNoFailureReasons: {
    id: 'IterationDetailsPage.gradeNoFailureReasons',
    defaultMessage: 'At max score — nothing to explain',
  },
  gradeLegend: {
    id: 'IterationDetailsPage.gradeLegend',
    defaultMessage:
      'A = Atomicity · CS = Clear steps · CER = Clear expected results · NIL = No invented logic · NIU = No invented UI · C = Coherence. Select a row for the failure reasons. Scores only — no pass/fail.',
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
    defaultMessage: 'Pipeline estimate',
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
  tokenUsageModel: {
    id: 'IterationDetailsPage.tokenUsageModel',
    defaultMessage: 'Model',
  },
  tokenUsageInput: {
    id: 'IterationDetailsPage.tokenUsageInput',
    defaultMessage: 'Input',
  },
  tokenUsageCacheRead: {
    id: 'IterationDetailsPage.tokenUsageCacheRead',
    defaultMessage: 'Cache read',
  },
  tokenUsageCacheWrite: {
    id: 'IterationDetailsPage.tokenUsageCacheWrite',
    defaultMessage: 'Cache write',
  },
  tokenUsageOutput: {
    id: 'IterationDetailsPage.tokenUsageOutput',
    defaultMessage: 'Output',
  },
  tokenUsageCost: {
    id: 'IterationDetailsPage.tokenUsageCost',
    defaultMessage: 'Est. cost',
  },
  tokenUsageLine: {
    id: 'IterationDetailsPage.tokenUsageLine',
    defaultMessage:
      '{model}: {input} in · {cacheRead} cache read · {cacheWrite} cache write · {output} out · Pipeline estimate {cost}',
  },
});
