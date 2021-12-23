/*
 * Copyright 2019 EPAM Systems
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

export const LAUNCH_STATISTICS = 'statisticTrend';
export const OVERALL_STATISTICS = 'overallStatistics';
export const LAUNCH_DURATION = 'launchesDurationChart';
export const LAUNCH_EXECUTION_AND_ISSUE_STATISTICS = 'launchStatistics';
export const PROJECT_ACTIVITY = 'activityStream';
export const TEST_CASES_GROWTH_TREND = 'casesTrend';
export const INVESTIGATED_PERCENTAGE_OF_LAUNCHES = 'investigatedTrend';
export const LAUNCHES_TABLE = 'launchesTable';
export const UNIQUE_BUGS_TABLE = 'uniqueBugTable';
export const MOST_FAILED_TEST_CASES_TABLE = 'topTestCases';
export const FAILED_CASES_TREND = 'bugTrend';
export const NON_PASSED_TEST_CASES_TREND = 'notPassed';
export const DIFFERENT_LAUNCHES_COMPARISON = 'launchesComparisonChart';
export const PASSING_RATE_PER_LAUNCH = 'passingRatePerLaunch';
export const PASSING_RATE_SUMMARY = 'passingRateSummary';
export const FLAKY_TEST_CASES_TABLE = 'flakyTestCases';
export const CUMULATIVE_TREND = 'cumulative';
export const PRODUCT_STATUS = 'productStatus';
export const MOST_TIME_CONSUMING = 'mostTimeConsuming';
export const MOST_POPULAR_PATTERNS = 'topPatternTemplates';
export const COMPONENT_HEALTH_CHECK = 'componentHealthCheck';
export const COMPONENT_HEALTH_CHECK_TABLE = 'componentHealthCheckTable';

export const HUMAN_WIDGET_TYPES_MAP = {
  [LAUNCH_STATISTICS]: 'Launch statistics chart',
  [OVERALL_STATISTICS]: 'Overall statistics',
  [LAUNCH_DURATION]: 'Launches duration chart',
  [LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: 'Launch execution and issue statistic',
  [PROJECT_ACTIVITY]: 'Project activity panel',
  [TEST_CASES_GROWTH_TREND]: 'Test-cases growth trend chart',
  [INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: 'Investigated percentage of launches',
  [LAUNCHES_TABLE]: 'Launches table',
  [UNIQUE_BUGS_TABLE]: 'Unique bugs table',
  [MOST_FAILED_TEST_CASES_TABLE]: 'Most failed test-cases table (TOP-20)',
  [FAILED_CASES_TREND]: 'Failed cases trend chart',
  [NON_PASSED_TEST_CASES_TREND]: 'Non-passed test-cases trend chart',
  [DIFFERENT_LAUNCHES_COMPARISON]: 'Different launches comparison chart',
  [PASSING_RATE_PER_LAUNCH]: 'Passing rate per launch',
  [PASSING_RATE_SUMMARY]: 'Passing rate summary',
  [FLAKY_TEST_CASES_TABLE]: 'Flaky test cases table (TOP-20)',
  [CUMULATIVE_TREND]: 'Cumulative trend chart',
  [MOST_TIME_CONSUMING]: 'Most time-consuming test cases widget (TOP-20)',
  [MOST_POPULAR_PATTERNS]: 'Most popular pattern table (TOP-20)',
  [COMPONENT_HEALTH_CHECK]: 'Component health check',
  [COMPONENT_HEALTH_CHECK_TABLE]: 'Component health check (table view)',
};
