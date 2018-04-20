import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Responsive, WidthProvider } from 'react-grid-layout';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { fetch } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import PropTypes from 'prop-types';
import styles from './widgetsGrid.scss';

const cx = classNames.bind(styles);
const ResponsiveGridLayout = WidthProvider(Responsive);

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
  };

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
    const { dashboardId } = this.props;

    fetch(`${this.props.url}/${dashboardId}`, {
      method: 'PUT',
      data: {
        updateWidgets: widgets,
      },
    });
  }

  fetchWidgets() {
    return fetch(this.props.url).then((result) => {
      const currentDashboard = result.find((item) => item.id === this.props.dashboardId);

      this.setState({ widgets: currentDashboard.widgets });
    });
  }

  render() {
    const { widgets } = this.state;
    const rowHeight = 63;
    let Items = null;
    let height = 0; // we need to set large height to avoid double scroll
    if (widgets.length) {
      Items = widgets.map(({ widgetPosition: [x, y], widgetSize: [w, h], widgetId }) => {
        height += h * (rowHeight + 20);
        return <div key={widgetId} className={cx('gadget-view')} data-grid={{ x, y, w, h }} />;
      });
    }

    const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
    const cols = { lg: 12, md: 12, sm: 1, xs: 1, xxs: 1 };

    return (
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
          onResizeStop={this.onGridChange}
          cols={cols}
        >
          {Items}
        </ResponsiveGridLayout>
      </ScrollWrapper>
    );
  }
}
