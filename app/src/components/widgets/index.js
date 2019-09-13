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
  LaunchExecutionAndIssueStatistics,
  CumulativeTrendChart,
  ComponentHealthCheck,
  OverallStatisticsChart,
  InvestigatedTrendChart,
} from './singleLevelWidgets/charts';
import {
  LaunchesTable,
  UniqueBugsTable,
  FlakyTests,
  MostFailedTests,
  ProjectActivity,
  ProductStatus,
  MostPopularPatterns,
} from './singleLevelWidgets/tables';
import {
  cumulativeFormatParams,
  topPatternsFormatParams,
  componentHealthCheckParams,
} from './utils';
import { MostTimeConsumingTestCases } from './singleLevelWidgets/mostTimeConsumingTestCases';

const CHARTS = {
  [widgetTypes.DIFFERENT_LAUNCHES_COMPARISON]: LaunchesComparisonChart,
  [widgetTypes.LAUNCH_STATISTICS]: LaunchStatisticsChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.FAILED_CASES_TREND]: FailedCasesTrendChart,
  [widgetTypes.NON_PASSED_TEST_CASES_TREND]: NonPassedTestCasesTrendChart,
  [widgetTypes.TEST_CASES_GROWTH_TREND]: TestCasesGrowthTrendChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.PASSING_RATE_PER_LAUNCH]: PassingRatePerLaunch,
  [widgetTypes.PASSING_RATE_SUMMARY]: PassingRatePerLaunch,
  [widgetTypes.LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: LaunchExecutionAndIssueStatistics,
  [widgetTypes.LAUNCHES_TABLE]: LaunchesTable,
  [widgetTypes.UNIQUE_BUGS_TABLE]: UniqueBugsTable,
  [widgetTypes.FLAKY_TEST_CASES_TABLE]: FlakyTests,
  [widgetTypes.MOST_FAILED_TEST_CASES_TABLE]: MostFailedTests,
  [widgetTypes.PROJECT_ACTIVITY]: ProjectActivity,
  [widgetTypes.PRODUCT_STATUS]: ProductStatus,
  [widgetTypes.CUMULATIVE_TREND]: CumulativeTrendChart,
  [widgetTypes.COMPONENT_HEALTH_CHECK]: ComponentHealthCheck,
  [widgetTypes.OVERALL_STATISTICS]: OverallStatisticsChart,
  [widgetTypes.INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: InvestigatedTrendChart,
  [widgetTypes.MOST_POPULAR_PATTERNS]: MostPopularPatterns,
  [widgetTypes.MOST_TIME_CONSUMING]: MostTimeConsumingTestCases,
};

const MULTI_LEVEL_WIDGETS_MAP = {
  [widgetTypes.CUMULATIVE_TREND]: {
    formatter: cumulativeFormatParams,
  },
  [widgetTypes.MOST_POPULAR_PATTERNS]: {
    formatter: topPatternsFormatParams,
  },
  [widgetTypes.COMPONENT_HEALTH_CHECK]: {
    formatter: componentHealthCheckParams,
  },
};

const STATIC_CHARTS = {
  [widgetTypes.CUMULATIVE_TREND]: true,
};

export { CHARTS, MULTI_LEVEL_WIDGETS_MAP, NoDataAvailable, STATIC_CHARTS };
