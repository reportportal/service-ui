import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import ReactObserver from 'react-event-observer';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { activeProjectSelector } from 'controllers/user';
import { fetchDashboardAction, updateDashboardWidgetsAction } from 'controllers/dashboard';
import { EmptyWidgetGrid } from './emptyWidgetGrid';
import styles from './widgetsGrid.scss';
import { Widget } from './widget';

const cx = classNames.bind(styles);
const ResponsiveGridLayout = WidthProvider(Responsive);
const rowHeight = 63;
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 12, sm: 4, xs: 4, xxs: 4 };
const messages = defineMessages({
  deleteWidgetSuccess: {
    id: 'WidgetsGrid.notification.deleteWidgetSuccess',
    defaultMessage: 'Widget has been deleted',
  },
});

@injectIntl
@connect(
  (state, ownProps) => ({
    deleteWidgetUrl: (widgetId) =>
      URLS.dashboardWidget(activeProjectSelector(state), ownProps.dashboard.id, widgetId),
  }),
  {
    showNotification,
    fetchDashboardAction,
    updateDashboardWidgetsAction,
  },
)
export class WidgetsGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    deleteWidgetUrl: PropTypes.func.isRequired,
    isFullscreen: PropTypes.bool,
    isModifiable: PropTypes.bool,
    showNotification: PropTypes.func.isRequired,
    fetchDashboardAction: PropTypes.func.isRequired,
    updateDashboardWidgetsAction: PropTypes.func.isRequired,
    showWidgetWizard: PropTypes.func.isRequired,
    loading: PropTypes.bool, // TODO: add from state when action logic will migrate to sagas
    dashboard: PropTypes.shape({
      widgets: PropTypes.array,
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  };

  static defaultProps = {
    isFullscreen: false,
    isModifiable: true,
    loading: false,
    dashboard: {
      widgets: [],
      id: '',
    },
  };

  constructor(props) {
    super(props);
    this.observer = ReactObserver();

    this.state = {
      isMobile: false,
    };
  }

  componentDidMount() {
    this.props.fetchDashboardAction();
  }

  componentDidUpdate({ dashboard }) {
    if (this.props.dashboard.id && this.props.dashboard.id !== dashboard.id) {
      this.props.fetchDashboardAction();
    }
  }

  onBreakpointChange = (newBreakpoint) => {
    this.setState({
      isMobile: /sm|xs/.test(newBreakpoint),
    });
  };

  onGridItemChange = (newLayout, oldWidgetPosition, newWidgetPosition) => {
    let newWidgets;
    const itemChanged = Object.keys(oldWidgetPosition).some(
      (prop) => oldWidgetPosition[prop] !== newWidgetPosition[prop],
    );

    if (itemChanged) {
      if (this.state.isMobile) {
        const oldWidgets = this.props.dashboard.widgets;

        newWidgets = newLayout.map(({ i, y, h }, index) => ({
          widgetId: i,
          widgetPosition: { positionX: oldWidgets[index].widgetPosition.positionX, positionY: y },
          widgetSize: { width: oldWidgets[index].widgetSize.width, height: h },
        }));
      } else {
        newWidgets = newLayout.map(({ i, x, y, w, h }) => ({
          widgetId: i,
          widgetPosition: { positionX: x, positionY: y },
          widgetSize: { width: w, height: h },
        }));
      }

      this.props.updateDashboardWidgetsAction({
        ...this.props.dashboard,
        widgets: newWidgets,
      });
    }
  };

  onResizeStart = (layout, oldItem) => {
    this.observer.publish(`${oldItem.i}_resizeStarted`);
  };

  onResizeStop = (newLayout, oldWidgetPosition, newWidgetPosition) => {
    this.onGridItemChange(newLayout, oldWidgetPosition, newWidgetPosition);
    this.observer.publish('widgetResized');
  };

  onDeleteWidget = (widgetId) => {
    const newWidgets = this.props.dashboard.widgets.filter(
      (widget) => widget.widgetId !== widgetId,
    );
    fetch(this.props.deleteWidgetUrl(widgetId), {
      method: 'DELETE',
    }).then(() => {
      this.props.updateDashboardWidgetsAction({
        ...this.props.dashboard,
        widgets: newWidgets,
      });
      this.props.showNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: this.props.intl.formatMessage(messages.deleteWidgetSuccess),
      });
    });
  };

  render() {
    const { widgets = [] } = this.props.dashboard;
    let Items = null;
    let height = 0; // we need to set large height to avoid double scroll
    if (widgets.length) {
      Items = widgets.map(
        ({
          widgetPosition: { positionX: x, positionY: y },
          widgetSize: { width: w, height: h },
          widgetId,
        }) => {
          height += h * (rowHeight + 20);
          return (
            <div
              key={widgetId}
              className={cx('widget-view')}
              data-grid={{ x, y, w, h, minW: 4, minH: 4, i: String(widgetId) }}
            >
              <Widget
                widgetId={widgetId}
                isFullscreen={this.props.isFullscreen}
                isModifiable={this.props.isModifiable}
                observer={this.observer}
                onDelete={() => {
                  this.onDeleteWidget(widgetId);
                }}
              />
            </div>
          );
        },
      );
    }

    return (
      <div
        className={cx('widgets-grid', {
          mobile: this.state.isMobile,
          'full-screen': this.props.isFullscreen,
        })}
      >
        {this.props.loading && (
          <div className={cx('preloader-container')}>
            <SpinningPreloader />
          </div>
        )}
        {!!widgets.length && (
          <ScrollWrapper
            autoHeight
            autoHeightMax={this.props.isFullscreen ? window.screen.height : height}
            hideTracksWhenNotNeeded
          >
            <ResponsiveGridLayout
              rowHeight={rowHeight}
              breakpoints={breakpoints}
              onBreakpointChange={this.onBreakpointChange}
              onDragStop={this.onGridItemChange}
              onResizeStart={this.onResizeStart}
              onResizeStop={this.onResizeStop}
              cols={cols}
              isDraggable={this.props.isModifiable}
              isResizable={this.props.isModifiable}
              draggableHandle=".draggable-field"
            >
              {Items}
            </ResponsiveGridLayout>
          </ScrollWrapper>
        )}

        {!this.props.loading &&
          !widgets.length && (
            <EmptyWidgetGrid
              action={this.props.showWidgetWizard}
              isFullscreen={this.props.isFullscreen}
            />
          )}
      </div>
    );
  }
}
