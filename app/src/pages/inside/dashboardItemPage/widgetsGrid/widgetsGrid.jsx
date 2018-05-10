import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { fetch } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import styles from './widgetsGrid.scss';
import { Widget } from './widget';

const cx = classNames.bind(styles);
const ResponsiveGridLayout = WidthProvider(Responsive);
const rowHeight = 63;

@connect((state) => ({
  url: `/api/v1/${activeProjectSelector(state)}/dashboard`,
}))
export class WidgetsGrid extends PureComponent {
  static propTypes = {
    url: PropTypes.string,
    isFullscreen: PropTypes.bool,
    dashboardId: PropTypes.string,
  };

  static defaultProps = {
    url: '',
    isFullscreen: false,
    dashboardId: '',
  };

  state = {
    widgets: [],
    isFetching: false,
    isDraggable: false,
  };

  constructor(props) {
    super(props);
    this.url = `${this.props.url}/${this.props.dashboardId}`;
    this.isResizing = false;
  }

  componentDidMount() {
    this.fetchWidgets();
  }

  onBreakpointChange = (newBreakpoint) => {
    this.isMobile = /sm|xs/.test(newBreakpoint);
  };

  onGridChange = (newLayout) => {
    let newWidgets;

    if (this.isMobile) {
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

  updateWidgets(widgets) {
    fetch(this.url, {
      method: 'PUT',
      data: {
        updateWidgets: widgets,
      },
    });
  }

  switchDraggable = (isDraggable) => {
    if (!this.isResizing) {
      this.setState({
        isDraggable,
      });
    }
  };

  onResizeStart = () => {
    this.isResizing = true;
  };

  onResizeStop = (newLayout) => {
    this.isResizing = false;
    this.onGridChange(newLayout);
  };

  fetchWidgets() {
    this.setState({ isFetching: true });

    return fetch(this.url).then(({ widgets }) => {
      this.setState({
        widgets,
        isFetching: false,
      });
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
            data-grid={{ x, y, w, h, minW: 4, minH: 4 }}
          >
            <Widget switchDraggable={this.switchDraggable} />
          </div>
        );
      });
    }

    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 12, md: 12, sm: 1, xs: 1, xxs: 1 };

    return (
      <div>
        {this.state.isFetching && <SpinningPreloader />}
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
            onResizeStart={this.onResizeStart}
            cols={cols}
            isDraggable={this.state.isDraggable}
          >
            {Items}
          </ResponsiveGridLayout>
        </ScrollWrapper>
      </div>
    );
  }
}
