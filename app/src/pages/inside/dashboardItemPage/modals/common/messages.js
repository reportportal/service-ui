/*
 * Copyright 2021 EPAM Systems
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
import {
  COMPONENT_HEALTH_CHECK,
  COMPONENT_HEALTH_CHECK_TABLE,
  CUMULATIVE_TREND,
  DIFFERENT_LAUNCHES_COMPARISON,
  FAILED_CASES_TREND,
  FLAKY_TEST_CASES_TABLE,
  INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
  LAUNCH_DURATION,
  LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
  LAUNCH_STATISTICS,
  LAUNCHES_TABLE,
  MOST_FAILED_TEST_CASES_TABLE,
  MOST_POPULAR_PATTERNS,
  MOST_TIME_CONSUMING,
  NON_PASSED_TEST_CASES_TREND,
  OVERALL_STATISTICS,
  PASSING_RATE_PER_LAUNCH,
  PASSING_RATE_SUMMARY,
  PROJECT_ACTIVITY,
  TEST_CASE_SEARCH,
  TEST_CASES_GROWTH_TREND,
  UNIQUE_BUGS_TABLE,
} from 'common/constants/widgetTypes';

export const widgetTypesMessages = defineMessages({
  [LAUNCH_STATISTICS]: {
    id: 'Widgets.Name.statisticTrend',
    defaultMessage: 'Launch statistics chart',
  },
  [OVERALL_STATISTICS]: {
    id: 'Widgets.Name.overallStatistics',
    defaultMessage: 'Overall statistics',
  },
  [LAUNCH_DURATION]: {
    id: 'Widgets.Name.launchesDurationChart',
    defaultMessage: 'Launches duration chart',
  },
  [LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: {
    id: 'Widgets.Name.launchStatistics',
    defaultMessage: 'Launch execution and issue statistic',
  },
  [PROJECT_ACTIVITY]: {
    id: 'Widgets.Name.activityStream',
    defaultMessage: 'Project activity panel',
  },
  [TEST_CASES_GROWTH_TREND]: {
    id: 'Widgets.Name.casesTrend',
    defaultMessage: 'Test-cases growth trend chart',
  },
  [INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: {
    id: 'Widgets.Name.investigatedTrend',
    defaultMessage: 'Investigated percentage of launches',
  },
  [LAUNCHES_TABLE]: {
    id: 'Widgets.Name.launchesTable',
    defaultMessage: 'Launches table',
  },
  [UNIQUE_BUGS_TABLE]: {
    id: 'Widgets.Name.uniqueBugTable',
    defaultMessage: 'Unique bugs table',
  },
  [MOST_FAILED_TEST_CASES_TABLE]: {
    id: 'Widgets.Name.mostFailedTestCases',
    defaultMessage: 'Most failed test-cases table (TOP-50)',
  },
  [FAILED_CASES_TREND]: {
    id: 'Widgets.Name.bugTrend',
    defaultMessage: 'Failed cases trend chart',
  },
  [NON_PASSED_TEST_CASES_TREND]: {
    id: 'Widgets.Name.notPassed',
    defaultMessage: 'Non-passed test-cases trend chart',
  },
  [DIFFERENT_LAUNCHES_COMPARISON]: {
    id: 'Widgets.Name.launchesComparisonChart',
    defaultMessage: 'Different launches comparison chart',
  },
  [PASSING_RATE_PER_LAUNCH]: {
    id: 'Widgets.Name.passingRatePerLaunch',
    defaultMessage: 'Passing rate per launch',
  },
  [PASSING_RATE_SUMMARY]: {
    id: 'Widgets.Name.passingRateSummary',
    defaultMessage: 'Passing rate summary',
  },
  [FLAKY_TEST_CASES_TABLE]: {
    id: 'Widgets.Name.flakyTestCases',
    defaultMessage: 'Flaky test cases table (TOP-50)',
  },
  [CUMULATIVE_TREND]: {
    id: 'Widgets.Name.cumulative',
    defaultMessage: 'Cumulative trend chart',
  },
  [MOST_POPULAR_PATTERNS]: {
    id: 'Widgets.Name.mostPopularPatterns',
    defaultMessage: 'Most popular pattern table (TOP-20)',
  },
  [COMPONENT_HEALTH_CHECK]: {
    id: 'Widgets.Name.componentHealthCheck',
    defaultMessage: 'Component health check',
  },
  [COMPONENT_HEALTH_CHECK_TABLE]: {
    id: 'Widgets.Name.componentHealthCheckTable',
    defaultMessage: 'Component health check (table view)',
  },
  [MOST_TIME_CONSUMING]: {
    id: 'Widgets.Name.mostTimeConsuming',
    defaultMessage: 'Most time-consuming test cases widget (TOP-20)',
  },
  [TEST_CASE_SEARCH]: {
    id: 'Widgets.Name.testCaseSearchTable',
    defaultMessage: 'Test case search',
  },
  /*
  [PRODUCT_STATUS]: {
    id: 'Widgets.Name.productStatus',
    defaultMessage: 'Product status',
  },
  */
});
