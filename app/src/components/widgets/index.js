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

import * as widgetTypes from 'common/constants/widgetTypes';
import { NoDataAvailable } from './noDataAvailable';
import {
  TestCasesGrowthTrendChart,
  LaunchesComparisonChart,
  LaunchesDurationChart,
  LaunchStatisticsChart,
  FailedCasesTrendChart,
  NonPassedTestCasesTrendChart,
  PassingRatePerLaunch,
  PassingRateSummary,
  LaunchExecutionAndIssueStatistics,
  OverallStatistics,
  InvestigatedTrendChart,
} from './singleLevelWidgets/charts';
import {
  LaunchesTable,
  UniqueBugsTable,
  FlakyTests,
  MostFailedTests,
  ProjectActivity,
  ProductStatus,
} from './singleLevelWidgets/tables';
import {
  cumulativeFormatParams,
  topPatternsFormatParams,
  componentHealthCheckFormatParams,
  componentHealthCheckTableFormatParams,
} from './utils';
import { MostTimeConsumingTestCases } from './singleLevelWidgets/mostTimeConsumingTestCases';
import {
  CumulativeTrendChart,
  MostPopularPatterns,
  ComponentHealthCheck,
  ComponentHealthCheckTable,
} from './multiLevelWidgets';

const CHARTS = {
  [widgetTypes.DIFFERENT_LAUNCHES_COMPARISON]: LaunchesComparisonChart,
  [widgetTypes.LAUNCH_STATISTICS]: LaunchStatisticsChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.FAILED_CASES_TREND]: FailedCasesTrendChart,
  [widgetTypes.NON_PASSED_TEST_CASES_TREND]: NonPassedTestCasesTrendChart,
  [widgetTypes.TEST_CASES_GROWTH_TREND]: TestCasesGrowthTrendChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.PASSING_RATE_PER_LAUNCH]: PassingRatePerLaunch,
  [widgetTypes.PASSING_RATE_SUMMARY]: PassingRateSummary,
  [widgetTypes.LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: LaunchExecutionAndIssueStatistics,
  [widgetTypes.LAUNCHES_TABLE]: LaunchesTable,
  [widgetTypes.UNIQUE_BUGS_TABLE]: UniqueBugsTable,
  [widgetTypes.FLAKY_TEST_CASES_TABLE]: FlakyTests,
  [widgetTypes.MOST_FAILED_TEST_CASES_TABLE]: MostFailedTests,
  [widgetTypes.PROJECT_ACTIVITY]: ProjectActivity,
  [widgetTypes.PRODUCT_STATUS]: ProductStatus,
  [widgetTypes.CUMULATIVE_TREND]: CumulativeTrendChart,
  [widgetTypes.COMPONENT_HEALTH_CHECK]: ComponentHealthCheck,
  [widgetTypes.OVERALL_STATISTICS]: OverallStatistics,
  [widgetTypes.INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: InvestigatedTrendChart,
  [widgetTypes.MOST_POPULAR_PATTERNS]: MostPopularPatterns,
  [widgetTypes.MOST_TIME_CONSUMING]: MostTimeConsumingTestCases,
  [widgetTypes.COMPONENT_HEALTH_CHECK_TABLE]: ComponentHealthCheckTable,
};

const MULTI_LEVEL_WIDGETS_MAP = {
  [widgetTypes.CUMULATIVE_TREND]: {
    formatter: cumulativeFormatParams,
  },
  [widgetTypes.MOST_POPULAR_PATTERNS]: {
    formatter: topPatternsFormatParams,
  },
  [widgetTypes.COMPONENT_HEALTH_CHECK]: {
    formatter: componentHealthCheckFormatParams,
  },
  [widgetTypes.COMPONENT_HEALTH_CHECK_TABLE]: {
    formatter: componentHealthCheckTableFormatParams,
  },
};

export { CHARTS, MULTI_LEVEL_WIDGETS_MAP, NoDataAvailable };
