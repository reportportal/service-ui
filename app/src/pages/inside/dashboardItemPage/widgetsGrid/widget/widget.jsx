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
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import { WidgetHeader } from './widgetHeader';
import { CHARTS } from './constants';
import styles from './widget.scss';

const cx = classNames.bind(styles);

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
    widgetId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    showModalAction: PropTypes.func.isRequired,
    switchDraggable: PropTypes.func,
    onDelete: PropTypes.func,
    isModifiable: PropTypes.bool,
    isFullscreen: PropTypes.bool,
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
    isFullscreen: false,
  };

  constructor(props) {
    super(props);
    this.isDragging = false;

    this.state = {
      loading: true,
      visible: true,
      widget: {
        content: {},
        contentParameters: {},
      },
    };
  }

  componentDidMount() {
    this.props.observer.subscribe(`${this.props.widgetId}_resizeStarted`, this.hideWidget);
    this.props.observer.subscribe('widgetResized', this.showWidget);
    this.fetchWidget();
  }

  componentWillUnmount() {
    this.props.observer.unsubscribe(`${this.props.widgetId}_resizeStarted`, this.hideWidget);
    this.props.observer.unsubscribe('widgetResized', this.showWidget);
  }

  getContentParams = () => this.state.widget.contentParameters || {};

  getWidgetOptions = () => this.getContentParams().widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  showWidget = () => {
    this.setState({
      visible: true,
    });
  };

  hideWidget = () => {
    this.setState({
      visible: false,
    });
  };

  fetchWidget = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);
    this.setState({
      loading: true,
    });
    fetch(this.props.url)
      .then((widget) => {
        this.setState({
          loading: false,
          widget,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
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
    const { widget, visible } = this.state;
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      meta: this.getWidgetOptions().viewMode,
    };

    const noWidgetDataAvailable = !widget.content || !Object.keys(widget.content).length;
    const Chart = CHARTS[headerData.type];

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
          <div ref={this.getWidgetNode} className={cx('widget', { hidden: !visible })}>
            {(this.state.loading && <SpinningPreloader />) ||
              (noWidgetDataAvailable ? (
                <NoDataAvailable />
              ) : (
                Chart && (
                  <Chart
                    widget={widget}
                    isFullscreen={this.props.isFullscreen}
                    container={this.node}
                    observer={this.props.observer}
                  />
                )
              ))}
          </div>
        </Fragment>
      </div>
    );
  }
}
