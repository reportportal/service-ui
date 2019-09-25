import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3-selection';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { intlShape, injectIntl } from 'react-intl';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { C3Chart } from 'components/widgets/common/c3chart';
import { getConfig } from '../common/statusPageChartConfig';
import { CHART_OFFSET } from '../launchStatisticsChart/constants';
import { createTooltip } from './utils';
import styles from './issuesStatusPageChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IssuesStatusPageChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
    height: PropTypes.number,
    interval: PropTypes.string,
  };

  static defaultProps = {
    height: 0,
    observer: {},
    interval: null,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    const { observer } = this.props;

    observer.subscribe && observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    const { observer } = this.props;

    this.node && this.node.removeEventListener('mousemove', this.getCoords);
    observer.unsubscribe && observer.unsubscribe('widgetResized', this.resizeChart);
    this.interactElems && this.interactElems.on('click mousemove mouseover mouseout', null);
    this.chart = null;
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;
    this.node.addEventListener('mousemove', this.getCoords);

    this.interactElems = d3.selectAll(this.node.querySelectorAll('.c3-area'));

    this.createInteractiveTooltip();
  };

  onItemMouseOver = () => this.tooltip.style('display', 'block');

  onItemMouseOut = () => this.tooltip.style('display', 'none');

  onItemMouseMove = (data) => {
    const rectWidth = this.node.querySelectorAll('.c3-event-rect')[0].getAttribute('width');
    const currentMousePosition = d3.mouse(this.chart.element);
    const itemWidth = rectWidth / data.values.length;
    const dataIndex = Math.trunc((currentMousePosition[0] - CHART_OFFSET) / itemWidth);
    const selectedLaunchData = data.values.find((item) => item.index === dataIndex);

    this.tooltip
      .html(() =>
        this.tooltipContentRenderer(selectedLaunchData, null, null, this.config.data.colors),
      )
      .style('left', `${currentMousePosition[0] - 90}px`)
      .style('top', `${currentMousePosition[1] - 50}px`);
  };

  getConfig = () => {
    const {
      intl: { formatMessage },
      widget,
      container,
      interval,
    } = this.props;

    const params = {
      content: widget.content,
      isPreview: false,
      formatMessage,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
        width: container.offsetWidth,
      },
    };

    this.size = params.size;

    const configParams = {
      ...params,
      interval,
      chartType: MODES_VALUES[CHART_MODES.AREA_VIEW],
      isPointsShow: false,
      isCustomTooltip: true,
    };

    this.config = getConfig(configParams);
    this.initTooltipContentRenderer();

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

  initTooltipContentRenderer = () => {
    const {
      intl: { formatMessage },
      widget: { content },
    } = this.props;
    const wrapperClassName = cx('tooltip-container');

    this.tooltipContentRenderer = createTooltip(content, formatMessage, wrapperClassName);
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;

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

  createInteractiveTooltip = () => {
    this.tooltip = d3.select(this.node.querySelector('.c3-tooltip-container'));

    this.interactElems &&
      this.interactElems
        .on('mousemove', this.onItemMouseMove)
        .on('mouseover', this.onItemMouseOver)
        .on('mouseout', this.onItemMouseOut);
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('auto-bugs-chart', 'timeline-mode')}>
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
