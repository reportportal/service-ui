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
  // CumulativeTrendChart,
  CumulativeTrendChartJs,
  OverallStatisticsChart,
  InvestigatedTrendChart,
} from './charts';
import {
  LaunchesTable,
  UniqueBugsTable,
  FlakyTests,
  MostFailedTests,
  ProjectActivity,
} from './tables';

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
  // [widgetTypes.CUMULATIVE_TREND]: CumulativeTrendChart,
  [widgetTypes.CUMULATIVE_TREND]: CumulativeTrendChartJs,
  [widgetTypes.OVERALL_STATISTICS]: OverallStatisticsChart,
  [widgetTypes.INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: InvestigatedTrendChart,
};

const MULTI_LEVEL_WIDGETS = [widgetTypes.CUMULATIVE_TREND];

export { CHARTS, MULTI_LEVEL_WIDGETS, NoDataAvailable };
