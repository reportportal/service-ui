/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { lazyload } from 'react-lazyload';
import { connect } from 'react-redux';
import { fetch, isEmptyObject } from 'common/utils';
import { URLS } from 'common/urls';
import { CUMULATIVE_TREND } from 'common/constants/widgetTypes';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { ErrorMessage } from 'components/main/errorMessage';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { CHARTS, MULTI_LEVEL_WIDGETS_MAP, NoDataAvailable } from 'components/widgets';
import { isWidgetDataAvailable } from '../../modals/common/utils';
import { WidgetHeader } from './widgetHeader';
import styles from './widget.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  forceUpdateWidgetTitle: {
    id: 'Widget.forceUpdateWidgetTitle',
    defaultMessage: 'Update widget data',
  },
  forceUpdateWidgetMessage: {
    id: 'Widget.forceUpdateWidgetMessage',
    defaultMessage:
      'Are you sure you want to update data in this widget? It could take <b>up to 15 minutes</b> depend on a database size on the project.',
  },
});

const SILENT_UPDATE_TIMEOUT = 60000;
const SILENT_UPDATE_TIMEOUT_FULLSCREEN = 30000;

@injectIntl
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
    intl: PropTypes.object.isRequired,
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
    dashboardOwner: PropTypes.string,
  };

  static defaultProps = {
    onDelete: () => {},
    switchDraggable: () => {},
    isModifiable: false,
    isFullscreen: false,
    isPrintMode: false,
    dashboardOwner: '',
  };

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

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
      userSettings: {},
      hasError: false,
      error: null,
    };
  }

  componentDidMount() {
    this.props.observer.subscribe(`${this.props.widgetId}_resizeStarted`, this.hideWidget);
    this.props.observer.subscribe('widgetResized', this.showWidget);
    this.fetchWidget({}, false);
  }

  componentWillUnmount() {
    this.props.observer.unsubscribe(`${this.props.widgetId}_resizeStarted`, this.hideWidget);
    this.props.observer.unsubscribe('widgetResized', this.showWidget);
    this.clearSilentUpdater();
  }

  onChangeUserSettings = (settings, callback = () => {}) => {
    this.setState({ userSettings: { ...this.state.userSettings, ...settings } }, callback);
  };

  onChangeWidgetLegend = (itemId, callback) => {
    const uncheckedItemIndex = this.uncheckedLegendItems.indexOf(itemId);
    const uncheckedLegendItems = [...this.uncheckedLegendItems];
    if (uncheckedItemIndex !== -1) {
      uncheckedLegendItems.splice(uncheckedItemIndex, 1);
    } else {
      uncheckedLegendItems.push(itemId);
    }
    this.uncheckedLegendItems = uncheckedLegendItems;
    if (callback) {
      this.forceUpdate(callback);
    }
  };

  getWidgetOptions = () => (this.state.widget.contentParameters || {}).widgetOptions || {};

  getWidgetNode = (node) => {
    this.node = node;
  };

  getWidgetContent = () => {
    const { widgetType, isPrintMode } = this.props;
    const { widget, queryParameters, userSettings } = this.state;

    if (this.state.loading) {
      return <SpinningPreloader />;
    }

    if (this.state.hasError) {
      return (
        <div className={cx('error-message-container')}>
          <ErrorMessage error={this.state.error} />
        </div>
      );
    }

    if (!isWidgetDataAvailable(widget) && (!MULTI_LEVEL_WIDGETS_MAP[widgetType] || !widget.id)) {
      return <NoDataAvailable />;
    }

    const Chart = CHARTS[widget.widgetType];

    return (
      Chart && (
        <Chart
          widget={widget}
          uncheckedLegendItems={this.uncheckedLegendItems}
          onChangeLegend={this.onChangeWidgetLegend}
          isFullscreen={this.props.isFullscreen}
          container={this.node}
          observer={this.props.observer}
          fetchWidget={this.fetchWidget}
          queryParameters={queryParameters}
          clearQueryParams={this.clearQueryParams}
          userSettings={userSettings}
          onChangeUserSettings={this.onChangeUserSettings}
          isPrintMode={isPrintMode}
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

  uncheckedLegendItems = [];

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
        this.fetchWidget({}, true, false).then(onClearParams);
      },
    );
  };

  clearSilentUpdater = () => {
    if (this.silentUpdaterId) {
      clearTimeout(this.silentUpdaterId);
    }
  };

  fetchWidget = (params = {}, silent = true, shouldClearQueryParams = true) => {
    const { isFullscreen } = this.props;
    const url = this.getWidgetUrl(params);
    this.clearSilentUpdater();

    if (!silent) {
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
            hasError: false,
            error: null,
          });
        }
        if (!this.props.isPrintMode) {
          this.clearSilentUpdater();
          this.silentUpdaterId = setTimeout(
            this.fetchWidget,
            isFullscreen ? SILENT_UPDATE_TIMEOUT_FULLSCREEN : SILENT_UPDATE_TIMEOUT,
          );
        }
      })
      .catch(() => {
        if (shouldClearQueryParams && !isEmptyObject(this.state.queryParameters)) {
          this.clearQueryParams();
        }
        this.setState({
          loading: false,
        });
      });
  };

  showEditWidgetModal = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.EDIT_WIDGET);
    this.props.showModalAction({
      id: 'editWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm: () => this.fetchWidget({ refresh: true }),
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_EDIT_WIDGET_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_EDIT_WIDGET_MODAL,
          changeName: DASHBOARD_PAGE_EVENTS.WIDGET_NAME_EDIT_WIDGET_MODAL,
          changeDescription: DASHBOARD_PAGE_EVENTS.WIDGET_DESCRIPTION_EDIT_WIDGET_MODAL,
          shareWidget: DASHBOARD_PAGE_EVENTS.SHARE_WIDGET_EDIT_WIDGET_MODAL,
          okBtn: DASHBOARD_PAGE_EVENTS.SAVE_BTN_EDIT_WIDGET_MODAL,
          editFilterIcon: DASHBOARD_PAGE_EVENTS.EDIT_FILTER_ICON_EDIT_WIDGET_MODAL,
          enterSearchParams: DASHBOARD_PAGE_EVENTS.ENTER_SEARCH_PARAMS_EDIT_WIDGET_MODAL,
          chooseFilter: DASHBOARD_PAGE_EVENTS.CHOOSE_FILTER_EDIT_WIDGET_MODAL,
          addFilter: DASHBOARD_PAGE_EVENTS.ADD_FILTER_BTN_EDIT_WIDGET_MODAL,
          cancelAddNewFilter: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_ADD_NEW_FILTER_EDIT_WIDGET_MODAL,
          addNewFilter: DASHBOARD_PAGE_EVENTS.ADD_NEW_FILTER_BTN_EDIT_WIDGET_MODAL,
          editFilterName: DASHBOARD_PAGE_EVENTS.EDIT_FILTER_NAME_EDIT_WIDGET_MODAL,
          sortingSelectParameters: DASHBOARD_PAGE_EVENTS.SORTING_FOR_NEW_FILTER_EDIT_WIDGET_MODAL,
          selectParamsForFilter: DASHBOARD_PAGE_EVENTS.PARAMS_FOR_FILTER_EDIT_WIDGET_MODAL,
          submitChanges: DASHBOARD_PAGE_EVENTS.SUBMIT_CHANGES_EDIT_WIDGET_MODAL,
          cancelEditFilter: DASHBOARD_PAGE_EVENTS.CANCEL_EDIT_FILTER_EDIT_WIDGET_MODAL,
        },
      },
    });
  };

  refreshWidget = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REFRESH_WIDGET);
    this.fetchWidget();
  };

  showDeleteWidgetModal = () => {
    this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.REMOVE_WIDGET);
    this.props.showModalAction({
      id: 'deleteWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm: () => this.props.onDelete(this.props.widgetId),
        eventsInfo: {
          closeIcon: DASHBOARD_PAGE_EVENTS.CLOSE_ICON_DELETE_WIDGET_MODAL,
          cancelBtn: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_DELETE_WIDGET_MODAL,
          deleteBtn: DASHBOARD_PAGE_EVENTS.DELETE_BTN_DELETE_WIDGET_MODAL,
        },
      },
    });
  };

  showForceUpdateWidgetModal = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.forceUpdateWidgetMessage),
        onConfirm: () => this.fetchWidget({ refresh: true }),
        title: formatMessage(messages.forceUpdateWidgetTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.UPDATE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      },
    });
  };

  render() {
    const { widget, visible } = this.state;
    const { isFullscreen, widgetType, isModifiable, isPrintMode, dashboardOwner } = this.props;
    const widgetOptions = this.getWidgetOptions();
    const headerData = {
      owner: widget.owner,
      shared: widget.share,
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      meta: [widgetOptions.viewMode],
      lastRefresh:
        widget.contentParameters &&
        widget.contentParameters.widgetOptions &&
        widget.contentParameters.widgetOptions.lastRefresh,
      state:
        widget.contentParameters &&
        widget.contentParameters.widgetOptions &&
        widget.contentParameters.widgetOptions.state,
    };
    if (widgetOptions.latest || widgetType === CUMULATIVE_TREND) {
      headerData.meta.push(widgetOptions.latest || true);
    }

    return (
      <div className={cx('widget-container', { disabled: isFullscreen })}>
        <div
          className={cx('widget-header', 'draggable-field', {
            modifiable: isModifiable,
          })}
        >
          <WidgetHeader
            data={headerData}
            onRefresh={this.refreshWidget}
            onDelete={this.showDeleteWidgetModal}
            onEdit={this.showEditWidgetModal}
            onForceUpdate={this.showForceUpdateWidgetModal}
            customClass={cx('common-control')}
            isPrintMode={isPrintMode}
            dashboardOwner={dashboardOwner}
          />
        </div>
        <div ref={this.getWidgetNode} className={cx('widget', { hidden: !visible })}>
          {this.getWidgetContent()}
        </div>
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
