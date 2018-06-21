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
} from 'common/constants/widgetTypes';
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

const titles = defineMessages({
  [LAUNCH_STATISTICS]: {
    id: 'Widgets.Name.statistic_trend',
    defaultMessage: 'Launch statistics chart',
  },
  [OVERALL_STATISTICS]: {
    id: 'Widgets.Name.overall_statistics',
    defaultMessage: 'Overall statistics',
  },
  [LAUNCH_DURATION]: {
    id: 'Widgets.Name.launches_duration_chart',
    defaultMessage: 'Launches duration chart',
  },
  [LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]: {
    id: 'Widgets.Name.launch_statistics',
    defaultMessage: 'Launch execution and issue statistic',
  },
  [PROJECT_ACTIVITY]: {
    id: 'Widgets.Name.activity_stream',
    defaultMessage: 'Project activity panel',
  },
  [TEST_CASES_GROWTH_TREND]: {
    id: 'Widgets.Name.cases_trend',
    defaultMessage: 'Test-Cases growth trend chart',
  },
  [INVESTIGATED_PERCENTAGE_OF_LAUNCHES]: {
    id: 'Widgets.Name.investigated_trend',
    defaultMessage: 'Investigated percentage of launches',
  },
  [LAUNCHES_TABLE]: {
    id: 'Widgets.Name.launches_table',
    defaultMessage: 'Launches table',
  },
  [UNIQUE_BUGS_TABLE]: {
    id: 'Widgets.Name.unique_bug_table',
    defaultMessage: 'Unique bugs table',
  },
  [MOST_FAILED_TEST_CASES_TABLE]: {
    id: 'Widgets.Name.most_failed_test_cases',
    defaultMessage: 'Most failure test-cases table (TOP-20)',
  },
  [FAILED_CASES_TREND]: {
    id: 'Widgets.Name.bug_trend',
    defaultMessage: 'Failed cases trend chart',
  },
  [NON_PASSED_TEST_CASES_TREND]: {
    id: 'Widgets.Name.not_passed',
    defaultMessage: 'Non-Passed test-cases trend chart',
  },
  [DIFFERENT_LAUNCHES_COMPARISON]: {
    id: 'Widgets.Name.launches_comparison_chart',
    defaultMessage: 'Different launches comparison chart',
  },
  [PASSING_RATE_PER_LAUNCH]: {
    id: 'Widgets.Name.passing_rate_per_launch',
    defaultMessage: 'Passing rate per launch',
  },
  [PASSING_RATE_SUMMARY]: {
    id: 'Widgets.Name.passing_rate_summary',
    defaultMessage: 'Passing rate summary',
  },
  [FLAKY_TEST_CASES_TABLE]: {
    id: 'Widgets.Name.flaky_test_cases',
    defaultMessage: 'Flaky test cases table (TOP-20)',
  },
  [CUMULATIVE_TREND]: {
    id: 'Widgets.Name.cumulative',
    defaultMessage: 'Cumulative trend chart',
  },
  [PRODUCT_STATUS]: {
    id: 'Widgets.Name.product_status',
    defaultMessage: 'Product status',
  },
});
export const getWidgets = (formatMessage) => [
  {
    id: LAUNCH_STATISTICS,
    title: formatMessage(titles[LAUNCH_STATISTICS]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.statistic_trend'}
        defaultMessage={
          '- in "Launch mode" shows the growth trend in the number of test cases with each selected statuses from run to run,<br> - in "Timeline mode" shows sum, distributed by dates.'
        }
      />
    ),
    preview: Parser(LAUNCH_STATISTICS_PREVIEW),
  },
  {
    id: OVERALL_STATISTICS,
    title: formatMessage(titles[OVERALL_STATISTICS]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.overall_statistics'}
        defaultMessage={'Shows summary of test cases with each statuses in the selected launches.'}
      />
    ),
    preview: Parser(OVERALL_STATISTICS_PREVIEW),
  },
  {
    id: LAUNCH_DURATION,
    title: formatMessage(titles[LAUNCH_DURATION]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launches_duration_chart'}
        defaultMessage={'Shows duration of the selected launches.'}
      />
    ),
    preview: Parser(LAUNCH_DURATION_PREVIEW),
  },
  {
    id: LAUNCH_EXECUTION_AND_ISSUE_STATISTICS,
    title: formatMessage(titles[LAUNCH_EXECUTION_AND_ISSUE_STATISTICS]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.launch_statistics'}
        defaultMessage={
          'Shows statistics of the last launch divided into 2 sections:</br> - Skipped, Passed, Failed </br> - Product Bug, System Issue, To Investigate, Automation Bugs.'
        }
      />
    ),
    preview: Parser(LAUNCH_EXECUTION_AND_ISSUE_STATISTICS_PREVIEW),
  },
  {
    id: PROJECT_ACTIVITY,
    title: formatMessage(titles[PROJECT_ACTIVITY]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.activity_stream'}
        defaultMessage={'Shows all activities occurring on the project.'}
      />
    ),
    preview: Parser(PROJECT_ACTIVITY_PREVIEW),
  },
  {
    id: TEST_CASES_GROWTH_TREND,
    title: formatMessage(titles[TEST_CASES_GROWTH_TREND]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.cases_trend'}
        defaultMessage={
          '- in "Launch Mode" shows the increment of test-cases from run to run,<br> - in "Timeline Mode" shows the increment of test-cases distributed by dates (in launches with the largest number of test-cases per day).'
        }
      />
    ),
    preview: Parser(TEST_CASES_GROWTH_TREND_PREVIEW),
  },
  {
    id: INVESTIGATED_PERCENTAGE_OF_LAUNCHES,
    title: formatMessage(titles[INVESTIGATED_PERCENTAGE_OF_LAUNCHES]),
    description: (
      <FormattedHTMLMessage
        id={'Widgets.Description.investigated_trend'}
        defaultMessage={
          '- in "Launch Mode" shows whether the launches are analyzed or not (the percentage of "Investigated"/"To Investigate") from run to run,<br> - in "Timeline Mode" shows percentage of "Investigated"/"To Investigate" tests in all runs per day distributed by dates.'
        }
      />
    ),
    preview: Parser(INVESTIGATED_PERCENTAGE_OF_LAUNCHES_PREVIEW),
  },
  {
    id: LAUNCHES_TABLE,
    title: formatMessage(titles[LAUNCHES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launches_table'}
        defaultMessage={'Shows the configurable table of launches.'}
      />
    ),
    preview: Parser(LAUNCHES_TABLE_PREVIEW),
  },
  {
    id: UNIQUE_BUGS_TABLE,
    title: formatMessage(titles[UNIQUE_BUGS_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.unique_bug_table'}
        defaultMessage={
          'Shows real identified bugs, posted to the Bug Tracking System, and existing in the BTS bugs, loaded on the project.'
        }
      />
    ),
    preview: Parser(UNIQUE_BUGS_TABLE_PREVIEW),
  },
  {
    id: MOST_FAILED_TEST_CASES_TABLE,
    title: formatMessage(titles[MOST_FAILED_TEST_CASES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.most_failed_test_cases'}
        defaultMessage={
          'Shows the TOP-20 most failing test cases within the specified previous launches.'
        }
      />
    ),
    preview: Parser(MOST_FAILED_TEST_CASES_TABLE_PREVIEW),
  },
  {
    id: FAILED_CASES_TREND,
    title: formatMessage(titles[FAILED_CASES_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.bug_trend'}
        defaultMessage={
          'Shows the trend of growth in the number of failed test cases from run to run.'
        }
      />
    ),
    preview: Parser(FAILED_CASES_TREND_PREVIEW),
  },
  {
    id: NON_PASSED_TEST_CASES_TREND,
    title: formatMessage(titles[NON_PASSED_TEST_CASES_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.not_passed'}
        defaultMessage={
          'Shows the percent ratio of non-passed test cases (Failed + Skipped) to Total cases from run to run.'
        }
      />
    ),
    preview: Parser(NON_PASSED_TEST_CASES_TREND_PREVIEW),
  },
  {
    id: DIFFERENT_LAUNCHES_COMPARISON,
    title: formatMessage(titles[DIFFERENT_LAUNCHES_COMPARISON]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.launches_comparison_chart'}
        defaultMessage={'Allows to compare statistics for 2 last launches side by side.'}
      />
    ),
    preview: Parser(DIFFERENT_LAUNCHES_COMPARISON_PREVIEW),
  },
  {
    id: PASSING_RATE_PER_LAUNCH,
    title: formatMessage(titles[PASSING_RATE_PER_LAUNCH]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.passing_rate_per_launch'}
        defaultMessage={
          'Shows the percentage ratio of Passed test cases to Total cases for last run of selected launch.'
        }
      />
    ),
    preview: Parser(PASSING_RATE_PER_LAUNCH_PREVIEW),
  },
  {
    id: PASSING_RATE_SUMMARY,
    title: formatMessage(titles[PASSING_RATE_SUMMARY]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.passing_rate_summary'}
        defaultMessage={
          'Shows the percentage ratio of Passed test cases to Total cases for set of launches.'
        }
      />
    ),
    preview: Parser(PASSING_RATE_SUMMARY_PREVIEW),
  },
  {
    id: FLAKY_TEST_CASES_TABLE,
    title: formatMessage(titles[FLAKY_TEST_CASES_TABLE]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.flaky_test_cases'}
        defaultMessage={
          'Shows the TOP-20 the most flaky test cases within the specified previous launches.'
        }
      />
    ),
    preview: Parser(FLAKY_TEST_CASES_TABLE_PREVIEW),
  },
  {
    id: CUMULATIVE_TREND,
    title: formatMessage(titles[CUMULATIVE_TREND]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.cumulative'}
        defaultMessage={
          'Shows the growth trend of summary statistics of launches with the same tag prefix.'
        }
      />
    ),
    preview: Parser(CUMULATIVE_TREND_PREVIEW),
  },
  {
    id: PRODUCT_STATUS,
    title: formatMessage(titles[PRODUCT_STATUS]),
    description: (
      <FormattedMessage
        id={'Widgets.Description.product_status'}
        defaultMessage={
          'Shows the configurable table that is representing launch statistics or group statistics by special filter.'
        }
      />
    ),
    preview: Parser(PRODUCT_STATUS_PREVIEW),
  },
];
