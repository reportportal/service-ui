import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import * as d3 from 'd3-selection';
import { injectIntl, intlShape } from 'react-intl';
import { TEST_ITEM_PAGE, PROJECT_LOG_PAGE } from 'controllers/pages/constants';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { ALL } from 'common/constants/reservedFilterIds';
import { C3Chart } from '../../charts/common/c3chart/index';
import styles from './timeConsumingTestCasesChart.scss';
import { CHART_OFFSET } from '../../charts/launchStatisticsChart/constants';
import { MESSAGES } from '../../charts/common/constants';
import { getConfig } from './getConfig';

const cx = classNames.bind(styles);

@injectIntl
export class TimeConsumingTestCasesChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    project: PropTypes.string.isRequired,
    navigate: PropTypes.func.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    availableHeight: PropTypes.number,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
    availableHeight: 300,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    const { observer } = this.props;

    observer.subscribe && observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentWillUnmount() {
    const { observer } = this.props;

    this.node && this.node.removeEventListener('mousemove', this.getCoords);
    observer.unsubscribe && observer.unsubscribe('widgetResized', this.resizeChart);
    this.interactElems && this.interactElems.on('click mousemove mouseover mouseout', null);
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;
    this.node.addEventListener('mousemove', this.getCoords);
    this.interactElems = d3.selectAll(this.node.querySelectorAll('.c3-area'));
  };

  onItemMouseOver = () => this.tooltip.style('display', 'block');

  onItemMouseOut = () => this.tooltip.style('display', 'none');

  onItemMouseMove = (data) => {
    const rectWidth = this.node.querySelectorAll('.c3-event-rect')[0].getAttribute('width');
    const currentMousePosition = d3.mouse(this.chart.element);
    const itemWidth = rectWidth / data.values.length;
    const dataIndex = Math.trunc((currentMousePosition[0] - CHART_OFFSET) / itemWidth);

    this.selectedLaunchData = data.values.find((item) => item.index === dataIndex);
  };

  getConfig = () => {
    const { widget, intl, container, availableHeight } = this.props;

    const params = {
      content: widget.content,
      isPreview: false,
      intl,
      positionCallback: this.getPosition,
      size: {
        height: availableHeight,
        width: container.offsetWidth,
      },
    };

    this.size = params.size;

    const configParams = {
      ...params,
      chartType: MODES_VALUES[CHART_MODES.BAR_VIEW],
      isPointsShow: false,
      messages: MESSAGES,
      isCustomTooltip: true,
      testCaseClickHandler: this.testCaseClickHandler,
    };

    this.config = getConfig(configParams);

    this.setState({
      isConfigReady: true,
    });
  };

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  resizeChart = () => {
    const { container } = this.props;
    const newHeight = container.offsetHeight;
    const newWidth = container.offsetWidth;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
        width: newWidth,
      });
      this.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
    }
  };

  testCaseClickHandler = (id) => {
    const {
      project,
      widget: {
        content: { result, latestLaunch = {} },
      },
      navigate,
    } = this.props;
    const targetElement = result.filter((el) => el.id === id)[0] || {};
    const { path } = targetElement;
    let itemLink;
    let pageType;

    if (path) {
      itemLink = `${latestLaunch.id}/${path.replace(/[.]/g, '/')}`;
      pageType = PROJECT_LOG_PAGE;
    } else {
      itemLink = `${latestLaunch.id}`;
      pageType = TEST_ITEM_PAGE;
    }

    const navigationParams = {
      payload: {
        projectId: project,
        filterId: ALL,
        testItemIds: itemLink,
      },
      type: pageType,
    };

    navigate(navigationParams);
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('time-consuming-chart')}>
          <C3Chart
            config={this.config}
            onChartCreated={this.onChartCreated}
            className={cx('widget-wrapper')}
          />
        </div>
      )
    );
  }
}
