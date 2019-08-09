import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { lazyload } from 'react-lazyload';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { CUMULATIVE_TREND } from 'common/constants/widgetTypes';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { CHARTS, MULTI_LEVEL_WIDGETS_MAP, NoDataAvailable } from 'components/widgets';
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
export class SimpleWidget extends Component {
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
    isPrintMode: PropTypes.bool,
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
    isPrintMode: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      visible: true,
      queryParameters: {},
      widget: {
        content: {},
        contentParameters: {},
      },
      uncheckedLegendItems: [],
      userSettings: {},
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

  onChangeUserSettings = (settings, callback = () => {}) => {
    this.setState({ userSettings: { ...this.state.userSettings, ...settings } }, callback);
  };

  onChangeWidgetLegend = (itemId, callback = () => {}) => {
    const uncheckedItemIndex = this.state.uncheckedLegendItems.indexOf(itemId);
    const uncheckedLegendItems = [...this.state.uncheckedLegendItems];
    if (uncheckedItemIndex !== -1) {
      uncheckedLegendItems.splice(uncheckedItemIndex, 1);
    } else {
      uncheckedLegendItems.push(itemId);
    }
    this.setState({ uncheckedLegendItems }, callback);
  };

  getWidgetOptions = () => (this.state.widget.contentParameters || {}).widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  getWidgetContent = () => {
    const { widgetType } = this.props;
    const { widget, uncheckedLegendItems, queryParameters, userSettings } = this.state;

    if (this.state.loading) {
      return <SpinningPreloader />;
    }

    if (!isWidgetDataAvailable(widget) && !MULTI_LEVEL_WIDGETS_MAP[widgetType]) {
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
          userSettings={userSettings}
          onChangeUserSettings={this.onChangeUserSettings}
        />
      )
    );
  };

  getWidgetUrl = (params) => {
    const { activeProject, widgetId, widgetType } = this.props;
    let url = URLS.widget(activeProject, widgetId);

    if (MULTI_LEVEL_WIDGETS_MAP[widgetType]) {
      const { queryParameters } = this.state;
      const queryParamsString = MULTI_LEVEL_WIDGETS_MAP[widgetType].formatter({
        ...queryParameters,
        ...params,
      });

      url = URLS.widgetMultilevel(activeProject, widgetId, queryParamsString);
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

  clearQueryParams = (onClearParams = () => {}) => {
    this.setState(
      {
        queryParameters: {},
      },
      () => {
        this.fetchWidget().then(onClearParams);
      },
    );
  };

  fetchWidget = (params = {}) => {
    const { tracking, isFullscreen } = this.props;
    const url = this.getWidgetUrl(params);
    this.silentUpdaterId && clearTimeout(this.silentUpdaterId);
    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);

    if (!isWidgetDataAvailable(this.state.widget) && !this.state.widget.id) {
      this.setState({
        loading: true,
      });
    }

    return fetch(url)
      .then((widget) => {
        const queryParameters = {
          ...this.state.queryParameters,
          ...params,
        };

        if (
          this.state.loading ||
          !isEqual(queryParameters, this.state.queryParameters) ||
          !isEqual(widget, this.state.widget)
        ) {
          this.setState({
            queryParameters,
            widget,
            loading: false,
          });
        }
        if (!this.props.isPrintMode) {
          this.silentUpdaterId = setTimeout(
            this.fetchWidget,
            isFullscreen ? SILENT_UPDATE_TIMEOUT_FULLSCREEN : SILENT_UPDATE_TIMEOUT,
          );
        }
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
        onConfirm: () => this.props.onDelete(this.props.widgetId),
      },
    });
  };

  render() {
    const { widget, visible } = this.state;
    const { isFullscreen, widgetType, isModifiable, isPrintMode } = this.props;
    const widgetOptions = this.getWidgetOptions();
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      meta: [widgetOptions.viewMode],
    };
    if (widgetOptions.latest || widgetType === CUMULATIVE_TREND) {
      headerData.meta.push(widgetOptions.latest || true);
    }

    return (
      <div className={cx('widget-container', { disabled: isFullscreen })}>
        <Fragment>
          <div
            className={cx('widget-header', 'draggable-field', {
              modifiable: isModifiable,
            })}
          >
            <WidgetHeader
              data={headerData}
              onRefresh={this.fetchWidget}
              onDelete={this.showDeleteWidgetModal}
              onEdit={this.showEditWidgetModal}
              customClass={cx('common-control')}
              isPrintMode={isPrintMode}
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

export const LazyloadWidget = lazyload({
  resize: true,
  offset: 1000,
  unmountIfInvisible: true,
})(SimpleWidget);

export const Widget = (props) =>
  props.isPrintMode ? <SimpleWidget {...props} /> : <LazyloadWidget {...props} />;

Widget.propTypes = {
  isPrintMode: PropTypes.bool,
};

Widget.defaultProps = {
  isPrintMode: false,
};
