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
import LazyLoad from 'react-lazyload';
import { connect } from 'react-redux';
import { DragNDropIcon } from '@reportportal/ui-kit';
import { fetch, isEmptyObject } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { TEST_CASE_SEARCH } from 'common/constants/widgetTypes';
import { showModalAction } from 'controllers/modal';
import { analyticsEnabledSelector, baseEventParametersSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  CHARTS,
  MATERIALIZED_VIEW_WIDGETS,
  MULTI_LEVEL_WIDGETS_MAP,
  WIDGETS_WITH_INTERNAL_EMPTY_STATE,
} from 'components/widgets';
import { STATE_RENDERING } from 'components/widgets/common/constants';
import { canWorkWithWidgets } from 'common/utils/permissions/permissions';
import { activeDashboardIdSelector, userRolesSelector } from 'controllers/pages';
import { refreshSearchedItemsAction } from 'controllers/testItem';
import { WIDGETS_EVENTS } from 'analyticsEvents/dashboardsPageEvents';
import { baseEventParametersShape, provideEcGA } from 'components/main/analytics/utils';
import { getEcWidget } from 'components/main/analytics/events/common/widgetPages/utils';
import { widgetTypesMessages } from 'pages/inside/dashboardItemPage/modals/common/messages';
import { isWidgetDataAvailable } from '../../modals/common/utils';
import { WidgetHeader } from './widgetHeader';
import { WidgetStateMessage } from './widgetStateMessage';
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
  generatingTitle: {
    id: 'Widget.generatingTitle',
    defaultMessage: 'Preparing widget data',
  },
  generatingDescription: {
    id: 'Widget.generatingDescription',
    defaultMessage: 'This can take up to several minutes.',
  },
  noDataTitle: {
    id: 'Widget.noDataTitle',
    defaultMessage: 'No data to display',
  },
  noDataDescription: {
    id: 'Widget.noDataDescription',
    defaultMessage: 'No launches match the widget filter yet.',
  },
  errorTitle: {
    id: 'Widget.errorTitle',
    defaultMessage: "Couldn't load the widget",
  },
  errorDescription: {
    id: 'Widget.errorDescription',
    defaultMessage: 'Something went wrong while loading the data.',
  },
  tryAgain: {
    id: 'Widget.tryAgain',
    defaultMessage: 'Try again',
  },
});

const SILENT_UPDATE_TIMEOUT = 60000;
const SILENT_UPDATE_TIMEOUT_FULLSCREEN = 30000;

@injectIntl
@connect(
  (state) => ({
    projectKey: projectKeySelector(state),
    activeDashboardId: activeDashboardIdSelector(state),
    isAnalyticsEnabled: analyticsEnabledSelector(state),
    baseEventParameters: baseEventParametersSelector(state),
    userRoles: userRolesSelector(state),
  }),
  {
    showModalAction,
    refreshSearchedItemsAction,
  },
)
@track()
export class SimpleWidget extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectKey: PropTypes.string.isRequired,
    widgetId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    widgetType: PropTypes.string.isRequired,
    showModalAction: PropTypes.func.isRequired,
    refreshSearchedItemsAction: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    isModifiable: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    observer: PropTypes.object.isRequired,
    isPrintMode: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    activeDashboardId: PropTypes.number.isRequired,
    isAnalyticsEnabled: PropTypes.bool.isRequired,
    baseEventParameters: baseEventParametersShape,
    userRoles: PropTypes.object,
  };

  static defaultProps = {
    onDelete: () => {},
    isModifiable: false,
    isFullscreen: false,
    isPrintMode: false,
    userRoles: {},
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
      queryParameters: {},
      widget: {
        content: {},
        contentParameters: {},
      },
      userSettings: {},
      hasError: false,
      error: null,
      displayLaunchesValue: false,
    };
  }

  componentDidMount() {
    this.fetchWidget({}, false);
  }

  componentWillUnmount() {
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

  getWidgetOptions = () => this.state.widget.contentParameters?.widgetOptions || {};

  canEdit = () => canWorkWithWidgets(this.props.userRoles);

  getWidgetNode = (node) => {
    this.node = node;
  };

  getWidgetContent = () => {
    const {
      widgetType,
      isPrintMode,
      intl: { formatMessage },
    } = this.props;
    const { widget, queryParameters, userSettings, displayLaunchesValue } = this.state;

    if (this.state.loading) {
      return <WidgetStateMessage isLoading />;
    }

    if (this.state.hasError) {
      return (
        <WidgetStateMessage
          title={formatMessage(messages.errorTitle)}
          description={formatMessage(messages.errorDescription)}
          action={{ label: formatMessage(messages.tryAgain), onClick: this.retryFetchWidget }}
        />
      );
    }

    if (
      MATERIALIZED_VIEW_WIDGETS.includes(widget.widgetType) &&
      widget.contentParameters?.widgetOptions?.state === STATE_RENDERING
    ) {
      return (
        <WidgetStateMessage
          isLoading
          title={formatMessage(messages.generatingTitle)}
          description={formatMessage(messages.generatingDescription)}
        />
      );
    }

    if (
      !isWidgetDataAvailable(widget) &&
      (!WIDGETS_WITH_INTERNAL_EMPTY_STATE.includes(widgetType) || !widget.id)
    ) {
      return (
        <WidgetStateMessage
          title={formatMessage(messages.noDataTitle)}
          description={formatMessage(messages.noDataDescription)}
        />
      );
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
          isDisplayedLaunches={displayLaunchesValue}
        />
      )
    );
  };

  getWidgetUrl = (params) => {
    const { projectKey, widgetId, widgetType } = this.props;
    let url = URLS.widget(projectKey, widgetId);

    if (MULTI_LEVEL_WIDGETS_MAP[widgetType]) {
      const { queryParameters } = this.state;
      const queryParamsString = MULTI_LEVEL_WIDGETS_MAP[widgetType].formatter({
        ...queryParameters,
        ...params,
      });

      url = URLS.widgetMultilevel(projectKey, widgetId, queryParamsString);
    }
    return url;
  };

  uncheckedLegendItems = [];

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
      .catch((error) => {
        if (shouldClearQueryParams && !isEmptyObject(this.state.queryParameters)) {
          this.clearQueryParams();
        }
        // a failed silent auto-update must not replace the content that is already shown
        const keepContent = silent && this.state.widget.id;
        this.setState({
          loading: false,
          ...(keepContent ? {} : { hasError: true, error }),
        });
      });
  };

  showEditWidgetModal = () => {
    const modalId = 'editWidgetModal';
    this.props.tracking.trackEvent(WIDGETS_EVENTS.CLICK_ON_EDIT_WIDGET_ICON);
    this.props.showModalAction({
      id: modalId,
      data: {
        widget: this.state.widget,
        onConfirm: (isForceUpdateNeeded) =>
          this.fetchWidget(isForceUpdateNeeded && { refresh: true }),
      },
    });
  };

  refreshWidget = () => {
    this.props.tracking.trackEvent(WIDGETS_EVENTS.CLICK_ON_REFRESH_WIDGET_ICON);
    this.fetchWidget({}, false);
  };

  retryFetchWidget = () => {
    this.fetchWidget({}, false);
  };

  refreshWidgetSearch = () => {
    const { widgetId } = this.props;
    this.props.tracking.trackEvent(WIDGETS_EVENTS.CLICK_ON_REFRESH_WIDGET_ICON);
    this.props.refreshSearchedItemsAction(widgetId);
  };

  showDeleteWidgetModal = () => {
    const { tracking, isAnalyticsEnabled, onDelete, baseEventParameters } = this.props;

    tracking.trackEvent(WIDGETS_EVENTS.CLICK_ON_DELETE_WIDGET_ICON);
    const onConfirm = () => {
      const { widgetId, activeDashboardId, widgetType } = this.props;
      const {
        widget: { id },
      } = this.state;

      onDelete(widgetId);
      if (isAnalyticsEnabled) {
        tracking.trackEvent(
          WIDGETS_EVENTS.clickOnDeleteWidgetButton(widgetType, activeDashboardId),
        );

        provideEcGA({
          eventName: 'remove_from_cart',
          baseEventParameters,
          additionalParameters: {
            item_list_name: activeDashboardId,
            items: [
              getEcWidget({
                itemId: id,
                itemName: widgetTypesMessages[widgetType].defaultMessage,
                itemListName: activeDashboardId,
              }),
            ],
          },
        });
      }
    };
    this.props.showModalAction({
      id: 'deleteWidgetModal',
      data: {
        widget: this.state.widget,
        onConfirm,
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
        onConfirm: () => this.fetchWidget({ refresh: true }, false),
        title: formatMessage(messages.forceUpdateWidgetTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.UPDATE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      },
    });
  };

  render() {
    const { widget, displayLaunchesValue, loading } = this.state;
    const { isModifiable, isPrintMode } = this.props;
    const widgetOptions = this.getWidgetOptions();
    const headerData = {
      name: widget.name,
      description: widget.description,
      type: widget.widgetType,
      lastRefresh: widgetOptions.lastRefresh,
      state: widgetOptions.state,
    };
    const isRefreshing = loading && Boolean(widget.id);
    const isTestCaseSearch = widget.widgetType === TEST_CASE_SEARCH;

    const handleDisplayLaunchesToggleChange = () => {
      const {
        activeDashboardId,
        tracking: { trackEvent },
      } = this.props;
      this.setState({
        displayLaunchesValue: !displayLaunchesValue,
      });
      trackEvent(WIDGETS_EVENTS.onDisplayLaunchesToggle(!displayLaunchesValue, activeDashboardId));
    };
    return (
      <div className={cx('widget-container', { modifiable: isModifiable })}>
        {isModifiable && (
          <div className={cx('drag-handle')}>
            <DragNDropIcon />
          </div>
        )}
        <div
          className={cx('widget-header', 'draggable-field', {
            modifiable: isModifiable,
          })}
        >
          <WidgetHeader
            data={headerData}
            onRefresh={isTestCaseSearch ? this.refreshWidgetSearch : this.refreshWidget}
            onDelete={this.showDeleteWidgetModal}
            onEdit={this.showEditWidgetModal}
            onForceUpdate={this.showForceUpdateWidgetModal}
            canEdit={this.canEdit()}
            isPrintMode={isPrintMode}
            isRefreshing={isRefreshing}
            isDisplayedLaunches={this.state.displayLaunchesValue}
            onDisplayLaunchesToggle={isTestCaseSearch ? handleDisplayLaunchesToggleChange : null}
          />
        </div>
        <div ref={this.getWidgetNode} className={cx('widget')}>
          {this.getWidgetContent()}
        </div>
      </div>
    );
  }
}

export const LazyLoadWidget = (props) => (
  <LazyLoad
    className={cx('lazy-load-wrapper')}
    height={'100%'}
    offset={1000}
    resize
    unmountIfInvisible
  >
    <SimpleWidget {...props} />
  </LazyLoad>
);

export const Widget = (props) =>
  props.isPrintMode ? <SimpleWidget {...props} /> : <LazyLoadWidget {...props} />;

Widget.propTypes = {
  isPrintMode: PropTypes.bool,
};

Widget.defaultProps = {
  isPrintMode: false,
};
