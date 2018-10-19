import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { LaunchesComparisonChart } from 'components/widgets/charts/launchesComparisonChart';
import { InvestigatedTrendChart } from 'components/widgets/charts/investigatedTrendChart';
import { WidgetHeader } from './widgetHeader';
import styles from './widget.scss';

const cx = classNames.bind(styles);

const charts = {
  launches_comparison_chart: LaunchesComparisonChart,
  investigated_trend: InvestigatedTrendChart,
};

@connect(
  (state, ownProps) => ({
    url: URLS.widget(activeProjectSelector(state), ownProps.widgetId),
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
        content_parameters: {},
      },
    };
  }

  componentDidMount() {
    this.fetchWidget();
  }

  getContentParams = () => this.state.widget.content_parameters || {};

  getWidgetOptions = () => this.getContentParams().widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  fetchWidget = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);
    this.setState({
      loading: true,
    });
    fetch(this.props.url).then((widget) => {
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
      type: this.getContentParams().gadget,
      meta: this.getWidgetOptions().viewMode,
    };

    const Chart = charts[widget.content_parameters.gadget];

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
