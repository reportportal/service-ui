import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
import { URLS } from 'common/urls';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import * as widgetTypes from 'common/constants/widgetTypes';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TestCasesGrowthTrendChart } from 'components/widgets/charts/testCasesGrowthTrendChart';
import { LaunchesComparisonChart } from 'components/widgets/charts/launchesComparisonChart';
import { UniqueBugsTable } from 'pages/inside/dashboardPage/widgets/uniqueBugsTable';
import { LaunchesDurationChart } from 'components/widgets/charts/launchesDurationChart';
import { LaunchesTable } from 'pages/inside/dashboardPage/widgets/launchesTable';
import { FailedCasesTrendChart } from 'components/widgets/charts/failedCasesTrendChart';
import { NonPassedTestCasesTrendChart } from 'components/widgets/charts/nonPassedTestCasesTrendChart';
import { PassingRatePerLaunch } from 'components/widgets/charts/passingRatePerLaunch';
import { WidgetHeader } from './widgetHeader';
import styles from './widget.scss';

const cx = classNames.bind(styles);

const charts = {
  [widgetTypes.UNIQUE_BUGS_TABLE]: UniqueBugsTable,
  [widgetTypes.DIFFERENT_LAUNCHES_COMPARISON]: LaunchesComparisonChart,
  [widgetTypes.LAUNCHES_TABLE]: LaunchesTable,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.FAILED_CASES_TREND]: FailedCasesTrendChart,
  [widgetTypes.NON_PASSED_TEST_CASES_TREND]: NonPassedTestCasesTrendChart,
  [widgetTypes.TEST_CASES_GROWTH_TREND]: TestCasesGrowthTrendChart,
  [widgetTypes.DIFFERENT_LAUNCHES_COMPARISON]: LaunchesComparisonChart,
  [widgetTypes.LAUNCH_DURATION]: LaunchesDurationChart,
  [widgetTypes.PASSING_RATE_PER_LAUNCH]: PassingRatePerLaunch,
};

@connect(
  (state, ownProps) => ({
    url: URLS.widget(activeProjectSelector(state), ownProps.widgetId),
    token: tokenSelector(state),
  }),
  {
    showModalAction,
  },
)
@track()
export class Widget extends Component {
  static propTypes = {
    url: PropTypes.string.isRequired,
    widgetId: PropTypes.number.isRequired,
    showModalAction: PropTypes.func.isRequired,
    switchDraggable: PropTypes.func,
    onDelete: PropTypes.func,
    isModifiable: PropTypes.bool,
    observer: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    token: PropTypes.string.isRequired,
  };

  static defaultProps = {
    onDelete: () => {},
    switchDraggable: () => {},
    isModifiable: false,
  };

  constructor(props) {
    super(props);
    this.isDragging = false;

    this.state = {
      loading: true,
      widget: {
        content: {},
        contentParameters: {},
      },
    };
  }

  componentDidMount() {
    this.fetchWidget();
  }

  getContentParams = () => this.state.widget.contentParameters || {};

  getWidgetOptions = () => this.getContentParams().widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  fetchWidget = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);
    this.setState({
      loading: true,
    });
    fetchAPI(this.props.url, this.props.token).then((widget) => {
      this.setState({
        loading: false,
        widget,
      });
    });
  };

  deleteWidget = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REMOVE_WIDGET);
    this.props.showModalAction({
      id: 'deleteWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm: () => this.props.onDelete(this.state.widget.id),
      },
    });
  };

  render() {
    const { widget } = this.state;
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      meta: this.getWidgetOptions().viewMode,
    };

    const Chart = charts[headerData.type];

    return (
      <div className={cx('widget-container')}>
        <Fragment>
          <div
            className={cx('widget-header', 'draggable-field', {
              modifiable: this.props.isModifiable,
            })}
            onMouseOver={this.onHeaderMouseOver}
            onMouseUp={this.onHeaderMouseUp}
            onMouseDown={this.onHeaderMouseDown}
          >
            <WidgetHeader
              data={headerData}
              onRefresh={this.fetchWidget}
              onDelete={this.deleteWidget}
            />
          </div>
          <div ref={this.getWidgetNode} className={cx('widget')}>
            {this.state.loading && <SpinningPreloader />}
            {Chart && (
              <Chart widget={widget} container={this.node} observer={this.props.observer} />
            )}
          </div>
        </Fragment>
      </div>
    );
  }
}
