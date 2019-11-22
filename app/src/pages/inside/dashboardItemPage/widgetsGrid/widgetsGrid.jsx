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
import { Responsive, WidthProvider } from 'react-grid-layout';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import ReactObserver from 'react-event-observer';
import { NOTIFICATION_TYPES } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import { EmptyWidgetGrid } from './emptyWidgetGrid';
import { Widget } from './widget';
import styles from './widgetsGrid.scss';

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
export class WidgetsGrid extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    currentUser: PropTypes.string.isRequired,
    isFullscreen: PropTypes.bool,
    isModifiable: PropTypes.bool,
    showNotification: PropTypes.func.isRequired,
    updateDashboardWidgetsAction: PropTypes.func.isRequired,
    showWidgetWizard: PropTypes.func,
    isPrintMode: PropTypes.bool,
    dashboard: PropTypes.shape({
      widgets: PropTypes.array,
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      owner: PropTypes.string,
    }),
  };

  static defaultProps = {
    isFullscreen: false,
    isModifiable: true,
    dashboard: {
      widgets: [],
      id: '',
      owner: '',
    },
    showWidgetWizard: () => {},
    isPrintMode: false,
  };

  constructor(props) {
    super(props);
    this.observer = ReactObserver();

    this.state = {
      isMobile: window.innerWidth <= breakpoints.sm,
    };
  }

  componentDidMount() {
    this.isFirefox = typeof InstallTrigger !== 'undefined';
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
      const oldWidgets = this.props.dashboard.widgets;

      if (this.state.isMobile) {
        newWidgets = newLayout.map(({ i, y, h }, index) => ({
          widgetId: i,
          widgetType: oldWidgets[index].widgetType,
          widgetPosition: { positionX: oldWidgets[index].widgetPosition.positionX, positionY: y },
          widgetSize: { width: oldWidgets[index].widgetSize.width, height: h },
        }));
      } else {
        newWidgets = newLayout.map(({ i, x, y, w, h }, index) => ({
          widgetId: i,
          widgetType: oldWidgets[index].widgetType,
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
    const { dashboard, activeProject } = this.props;

    fetch(URLS.dashboardWidget(activeProject, dashboard.id, widgetId), {
      method: 'DELETE',
    }).then(() => {
      const newWidgets = this.getUpdatedWidgetsAfterDelete(widgetId);

      this.props.updateDashboardWidgetsAction({
        ...dashboard,
        widgets: newWidgets,
      });
      this.props.showNotification({
        type: NOTIFICATION_TYPES.SUCCESS,
        message: this.props.intl.formatMessage(messages.deleteWidgetSuccess),
      });
    });
  };

  getUpdatedWidgetsAfterDelete = (widgetId) => {
    const newWidgets = [...this.props.dashboard.widgets];
    const widgetForDeleteIndex = newWidgets.findIndex((widget) => widget.widgetId === widgetId);
    const widgetForDelete = newWidgets.splice(widgetForDeleteIndex, 1)[0];
    const widgetForDeleteYPosition = widgetForDelete.widgetPosition.positionY;
    const isSomeWidgetsWithSameYPosition = newWidgets.some(
      (item) => item.widgetPosition.positionY === widgetForDeleteYPosition,
    );

    if (!isSomeWidgetsWithSameYPosition) {
      // update new widgets Y positions that greater than deleted widget Y position
      return newWidgets.map((item) =>
        item.widgetPosition.positionY > widgetForDeleteYPosition
          ? {
              ...item,
              widgetPosition: {
                ...item.widgetPosition,
                positionY: item.widgetPosition.positionY - widgetForDelete.widgetSize.height,
              },
            }
          : item,
      );
    }
    return newWidgets;
  };

  renderItems = () => {
    const {
      dashboard: { widgets = [], owner },
      currentUser,
    } = this.props;

    if (widgets.length) {
      const newWidgets =
        this.props.isPrintMode && owner !== currentUser
          ? widgets.filter((item) => item.share)
          : widgets;

      return newWidgets.map(
        ({
          widgetPosition: { positionX: x, positionY: y },
          widgetSize: { width: w, height: h },
          widgetId,
          widgetType,
        }) => (
          <div
            key={widgetId}
            className={cx('widget-view')}
            data-grid={{
              x,
              y,
              w,
              h,
              minW: 4,
              minH: 4,
              i: String(widgetId),
            }}
          >
            <Widget
              widgetId={widgetId}
              widgetType={widgetType}
              isFullscreen={this.props.isFullscreen}
              isModifiable={this.props.isModifiable}
              observer={this.observer}
              isPrintMode={this.props.isPrintMode}
              onDelete={this.onDeleteWidget}
              dashboardOwner={owner}
            />
          </div>
        ),
      );
    }

    return null;
  };

  renderWidgetsGridLayout = () => (
    <ResponsiveGridLayout
      observer={this.observer}
      isFullscreen={this.props.isFullscreen}
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
      useCSSTransforms={!this.isFirefox}
      measureBeforeMount
    >
      {this.renderItems()}
    </ResponsiveGridLayout>
  );

  renderContent = () => {
    const { dashboard, isFullscreen, isPrintMode } = this.props;
    const { widgets = [] } = dashboard;

    if (widgets.length) {
      return isFullscreen ? (
        <ScrollWrapper autoHeight autoHeightMax={window.innerHeight} hideTracksWhenNotNeeded>
          {this.renderWidgetsGridLayout()}
        </ScrollWrapper>
      ) : (
        this.renderWidgetsGridLayout()
      );
    }

    return (
      <EmptyWidgetGrid
        action={this.props.showWidgetWizard}
        isDisable={isFullscreen || isPrintMode}
        dashboard={dashboard}
      />
    );
  };

  render() {
    return (
      <div
        className={cx('widgets-grid', {
          mobile: this.state.isMobile,
          'non-resizable': this.props.isFullscreen || this.props.isPrintMode,
        })}
      >
        {this.renderContent()}
      </div>
    );
  }
}
