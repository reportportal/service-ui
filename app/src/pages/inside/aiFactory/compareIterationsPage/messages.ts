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
  comparisonUnavailable: {
    id: 'CompareIterationsPage.comparisonUnavailable',
    defaultMessage: 'Comparison is unavailable for this pipeline source',
  },
  pageTitle: {
    id: 'CompareIterationsPage.pageTitle',
    defaultMessage: 'Compare iterations',
  },
  pipelinesBreadcrumb: {
    id: 'CompareIterationsPage.pipelinesBreadcrumb',
    defaultMessage: 'Pipelines',
  },
  pipelineLabel: {
    id: 'CompareIterationsPage.pipelineLabel',
    defaultMessage: 'Pipeline',
  },
  baselineLabel: {
    id: 'CompareIterationsPage.baselineLabel',
    defaultMessage: 'Baseline',
  },
  candidateLabel: {
    id: 'CompareIterationsPage.candidateLabel',
    defaultMessage: 'Candidate',
  },
  loading: {
    id: 'CompareIterationsPage.loading',
    defaultMessage: 'Loading comparison…',
  },
  iterationOption: {
    id: 'CompareIterationsPage.iterationOption',
    defaultMessage: 'Iteration #{number}',
  },
  noPipelines: {
    id: 'CompareIterationsPage.noPipelines',
    defaultMessage: 'No pipelines are available to compare.',
  },
  notEnoughIterations: {
    id: 'CompareIterationsPage.notEnoughIterations',
    defaultMessage: 'At least two iterations of the same pipeline are required for comparison.',
  },
  invalidSelection: {
    id: 'CompareIterationsPage.invalidSelection',
    defaultMessage: 'Select two different iterations from the same pipeline.',
  },
  comparisonError: {
    id: 'CompareIterationsPage.comparisonError',
    defaultMessage: 'The comparison could not be loaded.',
  },
  noComparisonData: {
    id: 'CompareIterationsPage.noComparisonData',
    defaultMessage: 'No comparable stage or metric data is available for these iterations.',
  },
  retry: {
    id: 'CompareIterationsPage.retry',
    defaultMessage: 'Retry',
  },
  differentRequirements: {
    id: 'CompareIterationsPage.differentRequirements',
    defaultMessage: 'Different requirements — compare trends, not individual cases',
  },
  statusOnlyExplanation: {
    id: 'CompareIterationsPage.statusOnlyExplanation',
    defaultMessage:
      'This comparison provides iteration identity and stage statuses only. Metrics and directional deltas are unavailable.',
  },
  unknownStage: {
    id: 'CompareIterationsPage.unknownStage',
    defaultMessage: 'Stage: {stage}',
  },
  stagesTitle: {
    id: 'CompareIterationsPage.stagesTitle',
    defaultMessage: 'Stages',
  },
  metricsTitle: {
    id: 'CompareIterationsPage.metricsTitle',
    defaultMessage: 'Metrics',
  },
  metricColumn: {
    id: 'CompareIterationsPage.metricColumn',
    defaultMessage: 'Metric',
  },
  deltaColumn: {
    id: 'CompareIterationsPage.deltaColumn',
    defaultMessage: 'Δ',
  },
  metricTestCases: {
    id: 'CompareIterationsPage.metricTestCases',
    defaultMessage: 'Test Cases',
  },
  metricSuiteScore: {
    id: 'CompareIterationsPage.metricSuiteScore',
    defaultMessage: 'Suite score',
  },
  metricReady: {
    id: 'CompareIterationsPage.metricReady',
    defaultMessage: 'Ready',
  },
  metricFixRounds: {
    id: 'CompareIterationsPage.metricFixRounds',
    defaultMessage: 'Fix rounds',
  },
  metricAutoReadyPromoted: {
    id: 'CompareIterationsPage.metricAutoReadyPromoted',
    defaultMessage: 'Auto-Ready promoted',
  },
  metricCost: {
    id: 'CompareIterationsPage.metricCost',
    defaultMessage: 'Cost',
  },
  metricDuration: {
    id: 'CompareIterationsPage.metricDuration',
    defaultMessage: 'Duration',
  },
  stageCost: {
    id: 'CompareIterationsPage.stageCost',
    defaultMessage: 'Cost {cost}',
  },
  stageDuration: {
    id: 'CompareIterationsPage.stageDuration',
    defaultMessage: 'Duration {duration}',
  },
  unavailable: {
    id: 'CompareIterationsPage.unavailable',
    defaultMessage: '—',
  },
});
