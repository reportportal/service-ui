import * as widgetTypes from 'common/constants/widgetTypes';
import { TestCasesGrowthTrendChart } from 'components/widgets/charts/testCasesGrowthTrendChart';
import { LaunchesComparisonChart } from 'components/widgets/charts/launchesComparisonChart';
import { LaunchesDurationChart } from 'components/widgets/charts/launchesDurationChart';
import { LaunchStatisticsChart } from 'components/widgets/charts/launchStatisticsChart';
import { FailedCasesTrendChart } from 'components/widgets/charts/failedCasesTrendChart';
import { NonPassedTestCasesTrendChart } from 'components/widgets/charts/nonPassedTestCasesTrendChart';
import { PassingRatePerLaunch } from 'components/widgets/charts/passingRatePerLaunch';

export const CHARTS = {
  [widgetTypes.DIFFERENT_LAUNCHES_COMPARISON]: LaunchesComparisonChart,
  [widgetTypes.LAUNCH_STATISTICS]: LaunchStatisticsChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.FAILED_CASES_TREND]: FailedCasesTrendChart,
  [widgetTypes.NON_PASSED_TEST_CASES_TREND]: NonPassedTestCasesTrendChart,
  [widgetTypes.TEST_CASES_GROWTH_TREND]: TestCasesGrowthTrendChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.PASSING_RATE_PER_LAUNCH]: PassingRatePerLaunch,
  // [widgetTypes.UNIQUE_BUGS_TABLE]: UniqueBugsTable,
  // [widgetTypes.LAUNCHES_TABLE]: LaunchesTable,
  // [widgetTypes.FLAKY_TEST_CASES_TABLE]: FlakyTests,
  // [widgetTypes.MOST_FAILED_TEST_CASES_TABLE]: MostFailedTests,
};
