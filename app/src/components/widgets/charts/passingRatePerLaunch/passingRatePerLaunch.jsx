import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import * as COLORS from 'common/constants/colors';
import { STATS_PASSED } from 'common/constants/statistics';
import { C3Chart } from '../common/c3chart';
import { Legend } from '../common/legend';
import { messages } from '../common/messages';
import { getItemNameConfig, getItemName } from '../common/utils';
import { PassingRatePerLaunchTooltip } from './passingRatePerLaunchTooltip';
import styles from './passingRatePerLaunch.scss';

const cx = classNames.bind(styles);

const NOT_PASSED_STATISTICS_KEY = 'statistics$executions$notPassed';

@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getDefectLink: (params) => defectLinkSelector(state, params),
    getStatisticsLink: (name) => statisticsLinkSelector(state, { statuses: [name] }),
  }),
  {
    redirect,
  },
)
@injectIntl
export class PassingRatePerLaunch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    redirect: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    project: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentWillUnmount() {
    this.node.removeEventListener('mousemove', this.setupCoords);
    this.props.observer.unsubscribe('widgetResized', this.resizeChart);
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      d3.selectAll('.c3-chart-texts text, .c3-chart-arc text').each(() => {
        d3.select(this).remove();
      });
      return;
    }

    this.node.addEventListener('mousemove', this.setupCoords);

    if (!this.props.isPreview) {
      this.resizeHelper(this.node);
    }
  };

  onMouseOut = () => {
    this.chart.revert();
  };

  onMouseOver = (id) => {
    this.chart.focus(id);
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

  getProcessedData = (data, isPreview, colors) => {
    const itemNames = [STATS_PASSED, NOT_PASSED_STATISTICS_KEY];
    const columns = [
      [STATS_PASSED, parseInt(data.content.result.passed, 10)],
      [
        NOT_PASSED_STATISTICS_KEY,
        parseInt(data.content.result.total, 10) - parseInt(data.content.result.passed, 10),
      ],
    ];
    const columnData = {};
    columnData[STATS_PASSED] = columns[0][1];
    columnData[NOT_PASSED_STATISTICS_KEY] = columns[1][1];
    const chartData = {
      columns,
      groups: [itemNames],
      type: data.contentParameters.widgetOptions.viewMode === 'barMode' ? 'bar' : 'pie',
      onclick: () => {},
      order: null,
      colors,
      labels: {
        show: !isPreview,
        format: (v, id) => `${this.getPercentage(columnData[id])}%`,
      },
    };

    const bar =
      data.contentParameters.widgetOptions.viewMode === 'barMode'
        ? {
            width: {
              ratio: 0.35,
            },
          }
        : {};
    const pie =
      data.contentParameters.widgetOptions.viewMode === 'barMode'
        ? {}
        : {
            label: {
              show: !isPreview,
              threshold: 0.05,
              format: (value, r, id) => `${this.getPercentage(columnData[id])}%`,
            },
          };
    const padding =
      data.contentParameters.widgetOptions.viewMode === 'barMode'
        ? {
            top: isPreview ? 0 : 30,
            left: 20,
            right: 20,
            bottom: 0,
          }
        : {
            top: isPreview ? 0 : 85,
          };
    const axis =
      data.contentParameters.widgetOptions.viewMode === 'barMode'
        ? {
            rotated: true,
            x: {
              show: false,
            },
            y: {
              show: false,
              padding: {
                top: 0,
              },
            },
            bar: {
              width: {
                ratio: 0.35,
              },
            },
          }
        : {};
    return {
      chartData,
      itemNames,
      padding,
      pie,
      axis,
      bar,
    };
  };

  getConfig = () => {
    const { widget, isPreview, container } = this.props;
    const data = widget.content.result;
    const colors = {};
    colors[STATS_PASSED] = COLORS.COLOR_PASSED;
    colors[NOT_PASSED_STATISTICS_KEY] = COLORS.COLOR_NOTPASSED;
    const processedData = this.getProcessedData(widget, isPreview, colors);
    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.totalItems = parseInt(data.total, 10);

    this.config = {
      data: processedData.chartData,
      axis: processedData.axis,
      interaction: {
        enabled: !isPreview,
      },
      bar: processedData.bar,
      pie: processedData.pie,
      padding: processedData.padding,
      legend: {
        show: false,
      },
      tooltip: {
        grouped: false,
        position: this.getPosition,
        contents: this.renderContents,
      },
      size: {
        height: this.height,
      },
    };

    this.setState({
      isConfigReady: true,
    });
  };

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPercentage = (value) => (value / this.totalItems * 100).toFixed(2);

  resizeHelper = () => {
    // eslint-disable-next-line func-names
    d3.selectAll('.barMode .c3-chart-texts text').each(function(d) {
      const barBox = d3
        .selectAll(`.barMode .c3-target-${d.id}`)
        .node()
        .getBBox();
      const textBox = d3
        .select(this)
        .node()
        .getBBox();
      let x = barBox.x + barBox.width / 2 - textBox.width / 2;
      if (d.id === STATS_PASSED && x < 5) x = 5;
      if (d.id === NOT_PASSED_STATISTICS_KEY && x + textBox.width > barBox.x + barBox.width)
        x = barBox.x + barBox.width - textBox.width - 5;
      d3.select(this).attr('x', x);
    });
    // eslint-disable-next-line func-names
    d3.selectAll('.pieChartMode .c3-chart-arc text').each(function() {
      const elem = d3.select(this);
      (elem.datum().endAngle - elem.datum().startAngle) / 2 + elem.datum().startAngle > Math.PI
        ? elem.attr('dx', 10)
        : elem.attr('dx', -10);
    });
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;
    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
      });
      this.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
    }
    this.resizeHelper(this.node);
  };

  renderContents = (d, defaultTitleFormat, defaultValueFormat, color) => {
    const number = parseInt(d[0].value, 10);
    const id = d[0].id;
    const nameConfig = getItemNameConfig(d[0].name);

    return ReactDOMServer.renderToStaticMarkup(
      <PassingRatePerLaunchTooltip
        launchNumber={number}
        launchPercent={this.getPercentage(number)}
        color={color(id)}
        itemName={getItemName(nameConfig, {}, this.props.intl.formatMessage)}
      />,
    );
  };

  render() {
    const customBlock = (
      <div className={cx('launch-info-block')}>
        <span className={cx('launch-name-title')}>
          {this.props.intl.formatMessage(messages.launchName)}
        </span>
        <span className={cx('launch-name')}>{this.props.widget.name}</span>
      </div>
    );

    return (
      this.state.isConfigReady && (
        <C3Chart
          config={this.config}
          onChartCreated={this.onChartCreated}
          className={this.props.widget.contentParameters.widgetOptions.viewMode[0]}
        >
          {!this.props.isPreview && (
            <Legend
              items={[STATS_PASSED, NOT_PASSED_STATISTICS_KEY]}
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              customBlock={customBlock}
            />
          )}
        </C3Chart>
      )
    );
  }
}
