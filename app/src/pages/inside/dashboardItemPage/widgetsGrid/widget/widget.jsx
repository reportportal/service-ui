import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { lazyload } from 'react-lazyload';
import { connect } from 'react-redux';
import { fetch, formatAttribute } from 'common/utils';
import { URLS } from 'common/urls';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { CHARTS, MULTI_LEVEL_WIDGETS, NoDataAvailable } from 'components/widgets';
import { isWidgetDataAvailable } from '../../modals/common/utils';
import { WidgetHeader } from './widgetHeader';
import styles from './widget.scss';

const cx = classNames.bind(styles);

const SILENT_UPDATE_TIMEOUT = 60000;
const SILENT_UPDATE_TIMEOUT_FULLSCREEN = 30000;

@connect(
  (state) => ({
    activeProject: activeProjectSelector(state),
  }),
  {
    showModalAction,
  },
)
@track()
@lazyload({
  resize: true,
  offset: 1000,
  unmountIfInvisible: true,
})
export class Widget extends Component {
  static propTypes = {
    activeProject: PropTypes.string.isRequired,
    widgetId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    widgetType: PropTypes.string.isRequired,
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
      queryParameters: {},
      widget: {
        content: {},
        contentParameters: {},
      },
      uncheckedLegendItems: [],
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
    this.silentUpdaterId && clearTimeout(this.silentUpdaterId);
  }

  onChangeWidgetLegend = (itemId) => {
    const uncheckedItemIndex = this.state.uncheckedLegendItems.indexOf(itemId);
    const uncheckedLegendItems = [...this.state.uncheckedLegendItems];
    if (uncheckedItemIndex !== -1) {
      uncheckedLegendItems.splice(uncheckedItemIndex, 1);
    } else {
      uncheckedLegendItems.push(itemId);
    }
    this.setState({ uncheckedLegendItems });
  };

  getWidgetOptions = () => (this.state.widget.contentParameters || {}).widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  getWidgetContent = () => {
    const { widget, uncheckedLegendItems, queryParameters } = this.state;

    if (this.state.loading) {
      return <SpinningPreloader />;
    }

    if (!isWidgetDataAvailable(widget)) {
      return <NoDataAvailable />;
    }

    const Chart = CHARTS[widget.widgetType];

    return (
      Chart && (
        <Chart
          widget={widget}
          uncheckedLegendItems={uncheckedLegendItems}
          onChangeLegend={this.onChangeWidgetLegend}
          isFullscreen={this.props.isFullscreen}
          container={this.node}
          observer={this.props.observer}
          fetchWidget={this.fetchWidget}
          queryParameters={queryParameters}
          clearQueryParams={this.clearQueryParams}
        />
      )
    );
  };

  getWidgetUrl = (params) => {
    const { activeProject, widgetId, widgetType } = this.props;
    let url = URLS.widget(activeProject, widgetId);

    if (MULTI_LEVEL_WIDGETS.indexOf(widgetType) !== -1) {
      const {
        queryParameters: { attributes = [] },
      } = this.state;

      const attributesString = (params.attributes || attributes).map(formatAttribute).join(',');

      url = URLS.widgetMultilevel(activeProject, widgetId, attributesString);
    }
    return url;
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

  clearQueryParams = () => {
    this.setState(
      {
        queryParameters: {},
      },
      this.fetchWidget,
    );
  };

  fetchWidget = (params = {}) => {
    const { tracking, isFullscreen } = this.props;
    const url = this.getWidgetUrl(params);

    clearTimeout(this.silentUpdaterId);
    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);
    this.setState({
      loading: true,
    });
    fetch(url)
      .then((widget) => {
        this.setState({
          loading: false,
          queryParameters: {
            ...this.state.queryParameters,
            ...params,
          },
          widget,
        });
        this.silentUpdaterId = setTimeout(
          this.fetchWidget,
          isFullscreen ? SILENT_UPDATE_TIMEOUT_FULLSCREEN : SILENT_UPDATE_TIMEOUT,
        );
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  showEditWidgetModal = () => {
    this.props.showModalAction({
      id: 'editWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm: this.fetchWidget,
      },
    });
  };

  showDeleteWidgetModal = () => {
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
    const widgetOptions = this.getWidgetOptions();
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      meta: [widgetOptions.viewMode],
    };
    if (widgetOptions.latest) {
      headerData.meta.push(widgetOptions.latest);
    }

    return (
      <div className={cx('widget-container', { disabled: this.props.isFullscreen })}>
        <Fragment>
          <div
            className={cx('widget-header', 'draggable-field', {
              modifiable: this.props.isModifiable,
            })}
          >
            <WidgetHeader
              data={headerData}
              onRefresh={this.fetchWidget}
              onDelete={this.showDeleteWidgetModal}
              onEdit={this.showEditWidgetModal}
              customClass={cx('common-control')}
            />
          </div>
          <div ref={this.getWidgetNode} className={cx('widget', { hidden: !visible })}>
            {this.getWidgetContent()}
          </div>
        </Fragment>
      </div>
    );
  }
}
