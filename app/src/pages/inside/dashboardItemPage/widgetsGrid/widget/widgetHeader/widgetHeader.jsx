import React, { Component } from 'react';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { userIdSelector } from 'controllers/user';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import ShareIcon from 'common/img/share-icon-inline.svg';
import { DescriptionTooltipIcon } from './descriptionTooltipIcon';
import styles from './widgetHeader.scss';

const cx = classNames.bind(styles);
const widgetTypesMessages = defineMessages({
  statistic_trend: {
    id: 'WidgetHeader.widgetType.statistic_trend',
    defaultMessage: 'Launch statistics chart',
  },
  overall_statistics: {
    id: 'WidgetHeader.widgetType.overall_statistics',
    defaultMessage: 'Overall statistics',
  },
  launches_duration_chart: {
    id: 'WidgetHeader.widgetType.launches_duration_chart',
    defaultMessage: 'Launches duration chart',
  },
  launch_statistics: {
    id: 'WidgetHeader.widgetType.launch_statistics',
    defaultMessage: 'Launch statistics chart',
  },
  activity_stream: {
    id: 'WidgetHeader.widgetType.activity_stream',
    defaultMessage: 'Project activity panel',
  },
  cases_trend: {
    id: 'WidgetHeader.widgetType.cases_trend',
    defaultMessage: 'Test-cases growth trend chart',
  },
  investigated_trend: {
    id: 'WidgetHeader.widgetType.investigated_trend',
    defaultMessage: 'Investigated percentage of launches',
  },
  launches_table: {
    id: 'WidgetHeader.widgetType.launches_table',
    defaultMessage: 'Launches table',
  },
  unique_bug_table: {
    id: 'WidgetHeader.widgetType.unique_bug_table',
    defaultMessage: 'Unique bugs table',
  },
  most_failed_test_cases: {
    id: 'WidgetHeader.widgetType.most_failed_test_cases',
    defaultMessage: 'Most failed test-cases table (TOP-20)',
  },
  bug_trend: {
    id: 'WidgetHeader.widgetType.bug_trend',
    defaultMessage: 'Launch execution and issue statistic',
  },
  not_passed: {
    id: 'WidgetHeader.widgetType.not_passed',
    defaultMessage: 'Non-passed test-cases trend chart',
  },
  launches_comparison_chart: {
    id: 'WidgetHeader.widgetType.launches_comparison_chart',
    defaultMessage: 'Different launches comparison chart',
  },
  passing_rate_per_launch: {
    id: 'WidgetHeader.widgetType.passing_rate_per_launch',
    defaultMessage: 'Passing rate per launch',
  },
  passing_rate_summary: {
    id: 'WidgetHeader.widgetType.passing_rate_summary',
    defaultMessage: 'Passing rate summary',
  },
  product_status: {
    id: 'WidgetHeader.widgetType.product_status',
    defaultMessage: 'Product status',
  },
  cumulative: {
    id: 'WidgetHeader.widgetType.cumulative',
    defaultMessage: 'Cumulative trend chart',
  },
  flaky_test_cases: {
    id: 'WidgetHeader.widgetType.flaky_test_cases',
    defaultMessage: 'Flaky test cases table (TOP-20)',
  },
});
const messages = defineMessages({
  widgetIsShared: {
    id: 'WidgetHeader.widgetIsShared',
    defaultMessage: 'Your widget is shared',
  },
  sharedWidget: {
    id: 'WidgetHeader.sharedWidget',
    defaultMessage: 'Widget was created by { owner }',
  },
});
const widgetModeMessages = defineMessages({
  trendChart: {
    id: 'WidgetHeader.widgetMode.trendChart',
    defaultMessage: 'Trend chart',
  },
  lineChart: {
    id: 'WidgetHeader.widgetMode.lineChart',
    defaultMessage: 'Line chart',
  },
  panelMode: {
    id: 'WidgetHeader.widgetMode.panelMode',
    defaultMessage: 'Panel view',
  },
  chartMode: {
    id: 'WidgetHeader.widgetMode.chartMode',
    defaultMessage: 'Pie chart view',
  },
  barMode: {
    id: 'WidgetHeader.widgetMode.barMode',
    defaultMessage: 'Bar view',
  },
  pieChartMode: {
    id: 'WidgetHeader.widgetMode.pieChartMode',
    defaultMessage: 'Pie chart view',
  },
  donut: {
    id: 'WidgetHeader.widgetMode.donutChartMode',
    defaultMessage: 'Donut view',
  },
  trendChartMode: {
    id: 'WidgetHeader.widgetMode.trendChartMode',
    defaultMessage: 'Trend view',
  },
  areaChartMode: {
    id: 'WidgetHeader.widgetMode.areaChartMode',
    defaultMessage: 'Area view',
  },
});

@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
}))
export class WidgetHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    onRefresh: PropTypes.func,
    data: PropTypes.object,
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    onRefresh: () => {},
    onDelete: () => {},
    data: {},
  };

  render() {
    const { intl, onRefresh, data, userId, onDelete } = this.props;
    return (
      <div className={cx('widget-header')}>
        <div className={cx('info-block')}>
          <div className={cx('widget-name')}>
            <div className={cx('widget-name-block')}>{data.name}</div>
            <div className={cx('icons-block')}>
              {data.description && (
                <div className={cx('icon')}>
                  <DescriptionTooltipIcon tooltipContent={data.description} />
                </div>
              )}
              {data.shared &&
                data.owner === userId && (
                  <div className={cx('icon')} title={intl.formatMessage(messages.widgetIsShared)}>
                    {Parser(ShareIcon)}
                  </div>
                )}
              {data.shared &&
                data.owner !== userId && (
                  <div
                    className={cx('icon')}
                    title={intl.formatMessage(messages.sharedWidget, { owner: data.owner })}
                  >
                    {Parser(GlobeIcon)}
                  </div>
                )}
            </div>
          </div>
          <br />
          <div className={cx('widget-type')}>
            {widgetTypesMessages[data.type]
              ? intl.formatMessage(widgetTypesMessages[data.type])
              : data.type}
            <div className={cx('meta-info')}>
              {widgetModeMessages[data.meta]
                ? intl.formatMessage(widgetModeMessages[data.meta])
                : data.meta}
            </div>
          </div>
        </div>
        <div className={cx('controls-block')}>
          <div className={cx('control')}>{data.owner === userId && Parser(PencilIcon)}</div>
          <div className={cx('control')} onClick={onRefresh}>
            {Parser(RefreshIcon)}
          </div>
          <div className={cx('control')} onClick={onDelete}>
            {Parser(CrossIcon)}
          </div>
        </div>
      </div>
    );
  }
}
