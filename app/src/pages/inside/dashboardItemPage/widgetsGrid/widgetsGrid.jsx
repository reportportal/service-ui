import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import classNames from 'classnames/bind';
import { fetch } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { userInfoSelector, activeProjectSelector } from 'controllers/user';
import { canResizeAndDragWidgets } from 'common/utils/permissions';
import { URLS } from 'common/urls';
import { EmptyWidget } from './emptyWidget';
import styles from './widgetsGrid.scss';
import { Widget } from './widget';

const cx = classNames.bind(styles);
const ResponsiveGridLayout = WidthProvider(Responsive);
const rowHeight = 63;
const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 12, sm: 4, xs: 4, xxs: 4 };

@withRouter
@connect((state, ownProps) => ({
  url: URLS.dashboard(activeProjectSelector(state), ownProps.dashboardId),
  userInfo: userInfoSelector(state),
  project: activeProjectSelector(state),
}))
export class WidgetsGrid extends PureComponent {
  static propTypes = {
    url: PropTypes.string.isRequired,
    isFullscreen: PropTypes.bool,
    project: PropTypes.string.isRequired,
    userInfo: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  static defaultProps = {
    isFullscreen: false,
  };

  state = {
    widgets: [],
    isFetching: false,
    isMobile: false,
    isModifiable: false,
  };

  componentDidMount() {
    this.fetchWidgets();
  }

  componentDidUpdate({ url }) {
    if (this.props.url !== url) {
      this.fetchWidgets();
    }
  }

  onBreakpointChange = (newBreakpoint) => {
    this.setState({
      isMobile: /sm|xs/.test(newBreakpoint),
    });
  };

  onGridChange = (newLayout) => {
    let newWidgets;

    if (this.state.isMobile) {
      const oldWidgets = this.state.widgets;

      newWidgets = newLayout.map(({ i, y, h }, index) => ({
        widgetId: i,
        widgetPosition: [oldWidgets[index].widgetPosition[0], y],
        widgetSize: [oldWidgets[index].widgetSize[0], h],
      }));
    } else {
      newWidgets = newLayout.map(({ i, x, y, w, h }) => ({
        widgetId: i,
        widgetPosition: [x, y],
        widgetSize: [w, h],
      }));
    }

    this.setState({ widgets: newWidgets });
    this.updateWidgets(newWidgets);
  };

  onResizeStop = (newLayout) => {
    this.onGridChange(newLayout);
  };

  updateWidgets(widgets) {
    fetch(this.props.url, {
      method: 'PUT',
      data: {
        updateWidgets: widgets,
      },
    });
  }

  fetchWidgets() {
    const { userInfo, project } = this.props;
    const projectRole =
      userInfo.assigned_projects[project] && userInfo.assigned_projects[project].projectRole;

    this.setState({ isFetching: true });

    return fetch(this.props.url)
      .then((data) => {
        const isOwner = data.owner === userInfo.userId;

        this.setState({
          widgets: data.widgets,
          isFetching: false,
          isModifiable: canResizeAndDragWidgets(userInfo.userRole, projectRole, isOwner),
        });
      })
      .catch(({ response }) => {
        if (response.status === 404) {
          this.props.history.push(`/#${project}/dashboard`)
        }
      });
  }

  render() {
    const { widgets } = this.state;
    let Items = null;
    let height = 0; // we need to set large height to avoid double scroll

    if (widgets.length) {
      Items = widgets.map(({ widgetPosition: [x, y], widgetSize: [w, h], widgetId }) => {
        height += h * (rowHeight + 20);
        return (
          <div
            key={widgetId}
            className={cx('widget-view')}
            data-grid={{ x, y, w, h, minW: 4, minH: 4, i: widgetId }}
          >
            <Widget isModifiable={this.state.isModifiable} />
          </div>
        );
      });
    }

    return (
      <div className={this.state.isMobile ? 'mobile ' : ''}>
        {this.state.isFetching && <SpinningPreloader />}
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
              onDragStop={this.onGridChange}
              onResizeStop={this.onResizeStop}
              cols={cols}
              isDraggable={this.state.isModifiable}
              isResizable={this.state.isModifiable}
              draggableHandle=".draggable-field"
            >
              {Items}
            </ResponsiveGridLayout>
          </ScrollWrapper>
        )}

        {(!this.state.isFetching && !widgets.length) && <EmptyWidget />}
      </div>
    );
  }
}
