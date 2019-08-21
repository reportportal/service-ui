import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3-selection';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { intlShape, injectIntl } from 'react-intl';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import styles from './issuesStatusPageChart.scss';
import { C3Chart } from '../common/c3chart';
import { getConfig } from '../common/XYChartStatusPageConfig';
import { MESSAGES } from '../common/constants';
import { messages } from '../common/messages';
import { CHART_OFFSET } from '../launchStatisticsChart/constants';
import { TooltipContent } from '../common/tooltip/tooltipContent';

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
    this.selectedLaunchData = data.values.find((item) => item.index === dataIndex);

    this.tooltip
      .html(() => this.renderContents(this.selectedLaunchData))
      .style('left', `${currentMousePosition[0] - 90}px`)
      .style('top', `${currentMousePosition[1] - 50}px`);
  };

  getConfig = () => {
    const { widget, intl, container, interval } = this.props;

    const params = {
      content: widget.content,
      isPreview: false,
      intl,
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
      messages: MESSAGES,
      isCustomTooltip: true,
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

  renderContents = ({ id, index, value }) => {
    const { name } = this.props.widget.content[index];
    const {
      intl: { formatMessage },
    } = this.props;
    const formattedName = formatMessage(MESSAGES[id]);

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipContent
        launchName={name}
        launchNumber={null}
        startTime={null}
        itemCases={`${value} ${formatMessage(messages.cases)}`}
        withVerboseItemCases
        color={this.config.data.colors[id]}
        itemName={formattedName}
      />,
    );
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
