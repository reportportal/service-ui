import React, { Component } from 'react';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  userIdSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { canDeleteWidget } from 'common/utils/permissions';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PencilIcon from 'common/img/pencil-icon-inline.svg';
import RefreshIcon from 'common/img/refresh-icon-inline.svg';
import GlobeIcon from 'common/img/globe-icon-inline.svg';
import ShareIcon from 'common/img/share-icon-inline.svg';
import { DescriptionTooltipIcon } from './descriptionTooltipIcon';
import styles from './widgetHeader.scss';

const cx = classNames.bind(styles);
const widgetTypesMessages = defineMessages({
  statisticTrend: {
    id: 'WidgetHeader.widgetType.statisticTrend',
    defaultMessage: 'Launch statistics chart',
  },
  overallStatistics: {
    id: 'WidgetHeader.widgetType.overallStatistics',
    defaultMessage: 'Overall statistics',
  },
  launchesDurationChart: {
    id: 'WidgetHeader.widgetType.launchesDurationChart',
    defaultMessage: 'Launches duration chart',
  },
  launchStatistics: {
    id: 'WidgetHeader.widgetType.launchStatistics',
    defaultMessage: 'Launch execution and issue statistic',
  },
  activityStream: {
    id: 'WidgetHeader.widgetType.activityStream',
    defaultMessage: 'Project activity panel',
  },
  casesTrend: {
    id: 'WidgetHeader.widgetType.casesTrend',
    defaultMessage: 'Test-cases growth trend chart',
  },
  investigatedTrend: {
    id: 'WidgetHeader.widgetType.investigatedTrend',
    defaultMessage: 'Investigated percentage of launches',
  },
  launchesTable: {
    id: 'WidgetHeader.widgetType.launchesTable',
    defaultMessage: 'Launches table',
  },
  uniqueBugTable: {
    id: 'WidgetHeader.widgetType.uniqueBugTable',
    defaultMessage: 'Unique bugs table',
  },
  topTestCases: {
    id: 'WidgetHeader.widgetType.mostFailedTestCases',
    defaultMessage: 'Most failed test-cases table (TOP-20)',
  },
  bugTrend: {
    id: 'WidgetHeader.widgetType.bugTrend',
    defaultMessage: 'Failed cases trend chart',
  },
  notPassed: {
    id: 'WidgetHeader.widgetType.notPassed',
    defaultMessage: 'Non-passed test-cases trend chart',
  },
  launchesComparisonChart: {
    id: 'WidgetHeader.widgetType.launchesComparisonChart',
    defaultMessage: 'Different launches comparison chart',
  },
  passingRatePerLaunch: {
    id: 'WidgetHeader.widgetType.passingRatePerLaunch',
    defaultMessage: 'Passing rate per launch',
  },
  passingRateSummary: {
    id: 'WidgetHeader.widgetType.passingRateSummary',
    defaultMessage: 'Passing rate summary',
  },
  productStatus: {
    id: 'WidgetHeader.widgetType.productStatus',
    defaultMessage: 'Product status',
  },
  cumulative: {
    id: 'WidgetHeader.widgetType.cumulative',
    defaultMessage: 'Cumulative trend chart',
  },
  flakyTestCases: {
    id: 'WidgetHeader.widgetType.flakyTestCases',
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
  userRole: userAccountRoleSelector(state),
  projectRole: activeProjectRoleSelector(state),
}))
export class WidgetHeader extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    userId: PropTypes.string.isRequired,
    userRole: PropTypes.string,
    projectRole: PropTypes.string,
    data: PropTypes.object,
    onRefresh: PropTypes.func,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
  };
  static defaultProps = {
    data: {},
    userRole: '',
    projectRole: '',
    onRefresh: () => {},
    onDelete: () => {},
    onEdit: () => {},
  };

  render() {
    const { intl, data, userId, userRole, projectRole, onRefresh, onDelete, onEdit } = this.props;
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
          <div className={cx('control')} onClick={onEdit}>
            {data.owner === userId && Parser(PencilIcon)}
          </div>
          <div className={cx('control')} onClick={onRefresh}>
            {Parser(RefreshIcon)}
          </div>
          {canDeleteWidget(userRole, projectRole, userId === data.owner) && (
            <div className={cx('control')} onClick={onDelete}>
              {Parser(CrossIcon)}
            </div>
          )}
        </div>
      </div>
    );
  }
}
