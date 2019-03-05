import { FormattedMessage, FormattedHTMLMessage, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import {
  LAUNCH_STATISTICS,
  OVERALL_STATISTICS,
  LAUNCH_DURATION,
  LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
  PROJECT_ACTIVITY,
  TEST_CASES_GROWTH_TREND,
  INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
  LAUNCHES_TABLE,
  UNIQUE_BUGS_TABLE,
  MOST_FAILED_TEST_CASES_TABLE,
  FAILED_CASES_TREND,
  NON_PASSED_TEST_CASES_TREND,
  DIFFERENT_LAUNCHES_COMPARISON,
  PASSING_RATE_PER_LAUNCH,
  PASSING_RATE_SUMMARY,
  FLAKY_TEST_CASES_TABLE,
  CUMULATIVE_TREND,
  PRODUCT_STATUS,
  MOST_TIME_CONSUMING,
} from 'common/constants/widgetTypes';
import {
  LaunchStatisticsControls,
  OverallStatisticsControls,
  LaunchDurationControls,
  LaunchExecutionAndIssueStatisticsControls,
  ProjectActivityControls,
  TestCasesGrowthTrendControls,
  InvestigatedPercentageOfLaunchesControls,
  LaunchesTableControls,
  UniqueBugsTableControls,
  MostFailedTestCasesTableControls,
  FailedCasesTrendControls,
  NotPassedTestCasesTrendControls,
  DifferentLaunchesComparisonControls,
  PassingRatePerLaunchControls,
  PassingRateSummaryControls,
  FlakyTestCasesTableControls,
  CumulativeTrendControls,
  ProductStatusControls,
  MostTimeConsumingTestCasesControls,
} from './widgetControls';
import LAUNCH_STATISTICS_PREVIEW from './img/wdgt-launch-statistics-line-chart-inline.svg';
import OVERALL_STATISTICS_PREVIEW from './img/wdgt-overall-statistics-panel-inline.svg';
import LAUNCH_DURATION_PREVIEW from './img/wdgt-launches-duration-chart-inline.svg';
import LAUNCH_EXECUTION_AND_ISSUE_STATISTICS_PREVIEW from './img/wdgt-launch-execution-and-issue-statistic-inline.svg';
import PROJECT_ACTIVITY_PREVIEW from './img/wdgt-project-activity-panel-inline.svg';
import TEST_CASES_GROWTH_TREND_PREVIEW from './img/wdgt-test-cases-growth-trend-chart-inline.svg';
import INVESTIGATED_PERCENTAGE_OF_LAUNCHES_PREVIEW from './img/wdgt-investigated-percentage-of-launches-inline.svg';
import LAUNCHES_TABLE_PREVIEW from './img/wdgt-launch-table-inline.svg';
import UNIQUE_BUGS_TABLE_PREVIEW from './img/wdgt-unique-bugs-table-inline.svg';
import MOST_FAILED_TEST_CASES_TABLE_PREVIEW from './img/wdgt-most-failure-test-cases-table-inline.svg';
import FAILED_CASES_TREND_PREVIEW from './img/wdgt-failed-cases-trend-chart-inline.svg';
import NON_PASSED_TEST_CASES_TREND_PREVIEW from './img/wdgt-non-passed-test-cases-trend-inline.svg';
import DIFFERENT_LAUNCHES_COMPARISON_PREVIEW from './img/wdgt-different-launches-comparison-chart-inline.svg';
import PASSING_RATE_PER_LAUNCH_PREVIEW from './img/wdgt-passing-rate-launch-inline.svg';
import PASSING_RATE_SUMMARY_PREVIEW from './img/wdgt-passing-rate-summery-inline.svg';
import FLAKY_TEST_CASES_TABLE_PREVIEW from './img/wdgt-flaky-test-cases-table-inline.svg';
import CUMULATIVE_TREND_PREVIEW from './img/wdgt-cumulative-trend-chart-inline.svg';
import PRODUCT_STATUS_PREVIEW from './img/wdgt-product-satus-inline.svg';
import MOST_TIME_CONSUMING_PREVIEW from './img/wdgt-most-time-consuming-inline.svg';

export const widgetTitles = defineMessages({
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
    defaultMessage: 'Test-Cases growth trend chart',
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
    defaultMessage: 'Most failed test-cases table (TOP-20)',
  },
  [FAILED_CASES_TREND]: {
    id: 'Widgets.Name.bugTrend',
    defaultMessage: 'Failed cases trend chart',
  },
  [NON_PASSED_TEST_CASES_TREND]: {
    id: 'Widgets.Name.notPassed',
    defaultMessage: 'Non-Passed test-cases trend chart',
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
    defaultMessage: 'Flaky test cases table (TOP-20)',
  },
  [CUMULATIVE_TREND]: {
    id: 'Widgets.Name.cumulative',
    defaultMessage: 'Cumulative trend chart',
  },
  [PRODUCT_STATUS]: {
    id: 'Widgets.Name.productStatus',
    defaultMessage: 'Product status',
  },
  [MOST_TIME_CONSUMING]: {
    id: 'Widgets.Name.mostTimeConsuming',
    defaultMessage: 'The most time-consuming test cases widget (TOP-20)',
  },
});
export const getWidgets = (formatMessage) => [
  {
    id: LAUNCH_STATISTICS,
    title: formatMessage(widgetTitles[LAUNCH_STATISTICS]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.statisticTrend'}
        defaultMessage={
          '- in "Launch mode" shows the growth trend in the number of test cases with each selected statuses from run to run,<br> - in "Timeline mode" shows sum, distributed by dates.'
        }
      />
    ),
    preview: Parser(LAUNCH_STATISTICS_PREVIEW),
    controls: LaunchStatisticsControls,
  },
  {
    id: OVERALL_STATISTICS,
    title: formatMessage(widgetTitles[OVERALL_STATISTICS]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.overallStatistics'}
        defaultMessage={'Shows summary of test cases with each statuses in the selected launches.'}
      />
    ),
    preview: Parser(OVERALL_STATISTICS_PREVIEW),
    controls: OverallStatisticsControls,
  },
  {
    id: LAUNCH_DURATION,
    title: formatMessage(widgetTitles[LAUNCH_DURATION]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launchesDurationChart'}
        defaultMessage={'Shows duration of the selected launches.'}
      />
    ),
    preview: Parser(LAUNCH_DURATION_PREVIEW),
    controls: LaunchDurationControls,
  },
  {
    id: LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
    title: formatMessage(widgetTitles[LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.launchStatistics'}
        defaultMessage={
          'Shows statistics of the last launch divided into 2 sections:</br> - Skipped, Passed, Failed </br> - Product Bug, System Issue, To Investigate, Automation Bugs.'
        }
      />
    ),
    preview: Parser(LAUNCH_EXECUTION_AND_ISSUE_STATISTICS_PREVIEW),
    controls: LaunchExecutionAndIssueStatisticsControls,
  },
  {
    id: PROJECT_ACTIVITY,
    title: formatMessage(widgetTitles[PROJECT_ACTIVITY]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.activityStream'}
        defaultMessage={'Shows all activities occurring on the project.'}
      />
    ),
    preview: Parser(PROJECT_ACTIVITY_PREVIEW),
    controls: ProjectActivityControls,
  },
  {
    id: TEST_CASES_GROWTH_TREND,
    title: formatMessage(widgetTitles[TEST_CASES_GROWTH_TREND]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.casesTrend'}
        defaultMessage={
          '- in "Launch Mode" shows the increment of test-cases from run to run,<br> - in "Timeline Mode" shows the increment of test-cases distributed by dates (in launches with the largest number of test-cases per day).'
        }
      />
    ),
    preview: Parser(TEST_CASES_GROWTH_TREND_PREVIEW),
    controls: TestCasesGrowthTrendControls,
  },
  {
    id: INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
    title: formatMessage(widgetTitles[INVESTIGATED_PERCENTAGE_OF_LAUNCHES]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.investigatedTrend'}
        defaultMessage={
          '- in "Launch Mode" shows whether the launches are analyzed or not (the percentage of "Investigated"/"To Investigate") from run to run,<br> - in "Timeline Mode" shows percentage of "Investigated"/"To Investigate" tests in all runs per day distributed by dates.'
        }
      />
    ),
    preview: Parser(INVESTIGATED_PERCENTAGE_OF_LAUNCHES_PREVIEW),
    controls: InvestigatedPercentageOfLaunchesControls,
  },
  {
    id: LAUNCHES_TABLE,
    title: formatMessage(widgetTitles[LAUNCHES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launchesTable'}
        defaultMessage={'Shows the configurable table of launches.'}
      />
    ),
    preview: Parser(LAUNCHES_TABLE_PREVIEW),
    controls: LaunchesTableControls,
  },
  {
    id: UNIQUE_BUGS_TABLE,
    title: formatMessage(widgetTitles[UNIQUE_BUGS_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.uniqueBugTable'}
        defaultMessage={
          'Shows real identified bugs, posted to the Bug Tracking System, and existing in the BTS bugs, loaded on the project.'
        }
      />
    ),
    preview: Parser(UNIQUE_BUGS_TABLE_PREVIEW),
    controls: UniqueBugsTableControls,
  },
  {
    id: MOST_FAILED_TEST_CASES_TABLE,
    title: formatMessage(widgetTitles[MOST_FAILED_TEST_CASES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.mostFailedTestCases'}
        defaultMessage={
          'Shows the TOP-20 most failing test cases within the specified previous launches.'
        }
      />
    ),
    preview: Parser(MOST_FAILED_TEST_CASES_TABLE_PREVIEW),
    controls: MostFailedTestCasesTableControls,
  },
  {
    id: FAILED_CASES_TREND,
    title: formatMessage(widgetTitles[FAILED_CASES_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.bugTrend'}
        defaultMessage={
          'Shows the trend of growth in the number of failed test cases from run to run.'
        }
      />
    ),
    preview: Parser(FAILED_CASES_TREND_PREVIEW),
    controls: FailedCasesTrendControls,
  },
  {
    id: NON_PASSED_TEST_CASES_TREND,
    title: formatMessage(widgetTitles[NON_PASSED_TEST_CASES_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.notPassed'}
        defaultMessage={
          'Shows the percent ratio of non-passed test cases (Failed + Skipped) to Total cases from run to run.'
        }
      />
    ),
    preview: Parser(NON_PASSED_TEST_CASES_TREND_PREVIEW),
    controls: NotPassedTestCasesTrendControls,
  },
  {
    id: DIFFERENT_LAUNCHES_COMPARISON,
    title: formatMessage(widgetTitles[DIFFERENT_LAUNCHES_COMPARISON]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launchesComparisonChart'}
        defaultMessage={'Allows to compare statistics for 2 last launches side by side.'}
      />
    ),
    preview: Parser(DIFFERENT_LAUNCHES_COMPARISON_PREVIEW),
    controls: DifferentLaunchesComparisonControls,
  },
  {
    id: PASSING_RATE_PER_LAUNCH,
    title: formatMessage(widgetTitles[PASSING_RATE_PER_LAUNCH]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.passingRatePerLaunch'}
        defaultMessage={
          'Shows the percentage ratio of Passed test cases to Total cases for last run of selected launch.'
        }
      />
    ),
    preview: Parser(PASSING_RATE_PER_LAUNCH_PREVIEW),
    controls: PassingRatePerLaunchControls,
  },
  {
    id: PASSING_RATE_SUMMARY,
    title: formatMessage(widgetTitles[PASSING_RATE_SUMMARY]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.passingRateSummary'}
        defaultMessage={
          'Shows the percentage ratio of Passed test cases to Total cases for set of launches.'
        }
      />
    ),
    preview: Parser(PASSING_RATE_SUMMARY_PREVIEW),
    controls: PassingRateSummaryControls,
  },
  {
    id: FLAKY_TEST_CASES_TABLE,
    title: formatMessage(widgetTitles[FLAKY_TEST_CASES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.flakyTestCases'}
        defaultMessage={
          'Shows the TOP-20 the most flaky test cases within the specified previous launches.'
        }
      />
    ),
    preview: Parser(FLAKY_TEST_CASES_TABLE_PREVIEW),
    controls: FlakyTestCasesTableControls,
  },
  {
    id: CUMULATIVE_TREND,
    title: formatMessage(widgetTitles[CUMULATIVE_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.cumulative'}
        defaultMessage={
          'Shows the growth trend of summary statistics of launches with the same attribute key.'
        }
      />
    ),
    preview: Parser(CUMULATIVE_TREND_PREVIEW),
    controls: CumulativeTrendControls,
  },
  {
    id: PRODUCT_STATUS,
    title: formatMessage(widgetTitles[PRODUCT_STATUS]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.productStatus'}
        defaultMessage={
          'Shows the configurable table that is representing launch statistics or group statistics by special filter.'
        }
      />
    ),
    preview: Parser(PRODUCT_STATUS_PREVIEW),
    controls: ProductStatusControls,
  },
  {
    id: MOST_TIME_CONSUMING,
    title: formatMessage(widgetTitles[MOST_TIME_CONSUMING]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.mostTimeConsuming'}
        defaultMessage={
          'show the TOP 20 the most time-consuming test cases in the last execution of the specified launch.'
        }
      />
    ),
    preview: Parser(MOST_TIME_CONSUMING_PREVIEW),
    controls: MostTimeConsumingTestCasesControls,
  },
];

export const TABLE_WIDGETS_PREVIEWS = {
  [FLAKY_TEST_CASES_TABLE]: Parser(FLAKY_TEST_CASES_TABLE_PREVIEW),
  [LAUNCHES_TABLE]: Parser(LAUNCHES_TABLE_PREVIEW),
  [MOST_FAILED_TEST_CASES_TABLE]: Parser(MOST_FAILED_TEST_CASES_TABLE_PREVIEW),
  [PROJECT_ACTIVITY]: Parser(PROJECT_ACTIVITY_PREVIEW),
  [UNIQUE_BUGS_TABLE]: Parser(UNIQUE_BUGS_TABLE_PREVIEW),
};
