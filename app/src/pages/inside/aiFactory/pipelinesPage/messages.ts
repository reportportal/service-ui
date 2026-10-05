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
  pageTitle: {
    id: 'PipelinesPage.pageTitle',
    defaultMessage: 'Pipelines',
  },
  refreshPage: {
    id: 'PipelinesPage.refreshPage',
    defaultMessage: 'Refresh',
  },
  compareIterations: {
    id: 'PipelinesPage.compareIterations',
    defaultMessage: 'Compare iterations',
  },
  searchPlaceholder: {
    id: 'PipelinesPage.searchPlaceholder',
    defaultMessage: 'Search by requirement, iteration # or pipeline name',
  },
  noPipelines: {
    id: 'PipelinesPage.noPipelines',
    defaultMessage: 'No pipeline iterations yet',
  },
  noPipelinesHint: {
    id: 'PipelinesPage.noPipelinesHint',
    defaultMessage: 'Iterations appear here once a pipeline runs',
  },
  noIterationsMatch: {
    id: 'PipelinesPage.noIterationsMatch',
    defaultMessage: 'No iterations match',
  },
  iterationsCount: {
    id: 'PipelinesPage.iterationsCount',
    defaultMessage: '{count} {count, plural, one {iteration} other {iterations}}',
  },
  iterationTitle: {
    id: 'PipelinesPage.iterationTitle',
    defaultMessage: 'Iteration #{number}',
  },
  autoReadyOn: {
    id: 'PipelinesPage.autoReadyOn',
    defaultMessage: 'Auto-Ready ON ≥ {threshold}',
  },
  autoReadyOff: {
    id: 'PipelinesPage.autoReadyOff',
    defaultMessage: 'Auto-Ready OFF',
  },
  stageMetricCases: {
    id: 'PipelinesPage.stageMetricCases',
    defaultMessage: '{count} {count, plural, one {case} other {cases}}',
  },
  stageMetricScore: {
    id: 'PipelinesPage.stageMetricScore',
    defaultMessage: 'Score {score}',
  },
  stageMetricReady: {
    id: 'PipelinesPage.stageMetricReady',
    defaultMessage: '{ready}/{total} Ready',
  },
  outcomeReady: {
    id: 'PipelinesPage.outcomeReady',
    defaultMessage: '{ready} of {total} Ready',
  },
  outcomeFixRounds: {
    id: 'PipelinesPage.outcomeFixRounds',
    defaultMessage: ' · {count} {count, plural, one {fix round} other {fix rounds}}',
  },
  outcomeAutomating: {
    id: 'PipelinesPage.outcomeAutomating',
    defaultMessage: 'Automating {count} {count, plural, one {test case} other {test cases}}',
  },
  outcomeImplemented: {
    id: 'PipelinesPage.outcomeImplemented',
    defaultMessage: '{implemented} of {total} implemented',
  },
  outcomeLaunch: {
    id: 'PipelinesPage.outcomeLaunch',
    defaultMessage: ' · Launch #{number}',
  },
  metaTestCasesCount: {
    id: 'PipelinesPage.metaTestCasesCount',
    defaultMessage: '{count} Test Cases',
  },
  metaSuiteScore: {
    id: 'PipelinesPage.metaSuiteScore',
    defaultMessage: 'Suite score {score}',
  },
  repositoryNotProvided: {
    id: 'PipelinesPage.repositoryNotProvided',
    defaultMessage: 'Repository not provided',
  },
  iterationsUnavailable: {
    id: 'PipelinesPage.iterationsUnavailable',
    defaultMessage: 'Iterations are temporarily unavailable',
  },
  retry: {
    id: 'PipelinesPage.retry',
    defaultMessage: 'Retry',
  },
  liveStatusPending: {
    id: 'PipelinesPage.liveStatusPending',
    defaultMessage: 'Pending',
  },
  liveStatusPassed: {
    id: 'PipelinesPage.liveStatusPassed',
    defaultMessage: 'Passed',
  },
  liveStatusFailed: {
    id: 'PipelinesPage.liveStatusFailed',
    defaultMessage: 'Failed',
  },
  liveStatusNeedsHuman: {
    id: 'PipelinesPage.liveStatusNeedsHuman',
    defaultMessage: 'Needs human review',
  },
  liveStatusUnknown: {
    id: 'PipelinesPage.liveStatusUnknown',
    defaultMessage: 'Unknown',
  },
});
