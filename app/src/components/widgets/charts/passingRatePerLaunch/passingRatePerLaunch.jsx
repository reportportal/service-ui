import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import * as COLORS from 'common/constants/colors';
import * as d3 from 'd3-selection';
import ReactDOMServer from 'react-dom/server';
import { C3Chart } from '../common/c3chart';
import { TooltipWrapper, TooltipPassingContent } from '../common/tooltip';
import './passingRatePerLaunch.scss';
import { Legend } from '../common/legend';

const messages = defineMessages({
  Passed: {
    id: 'FilterNameById.statistics$executions$passed',
    defaultMessage: 'Passed',
  },
  Failed: {
    id: 'FilterNameById.statistics$executions$failed',
    defaultMessage: 'Failed',
  },
});

@injectIntl
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
    this.node.removeEventListener('mousemove', this.getCoords);
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

    this.node.addEventListener('mousemove', this.getCoords);

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
    const { intl } = this.props;
    const passedTranslations = intl.formatMessage(messages.Passed);
    const failedTranslations = intl.formatMessage(messages.Failed);
    const itemNames = [passedTranslations, failedTranslations];
    const columns = [
      [passedTranslations, parseInt(data.content.result.passed, 10)],
      [
        failedTranslations,
        parseInt(data.content.result.total, 10) - parseInt(data.content.result.passed, 10),
      ],
    ];
    const columnData = {};
    columnData[passedTranslations] = columns[0][1];
    columnData[failedTranslations] = columns[1][1];
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
    const { widget, intl, isPreview, container } = this.props;
    const passedTranslations = intl.formatMessage(messages.Passed);
    const failedTranslations = intl.formatMessage(messages.Failed);
    const data = widget.content.result;
    const colors = {};
    colors[passedTranslations] = COLORS.COLOR_PASSED_PER_LAUNCH;
    colors[failedTranslations] = COLORS.COLOR_FAILED_PER_LAUNCH;
    const processedData = this.getProcessedData(widget, isPreview, colors);
    this.chartType = widget.contentParameters.widgetOptions.viewMode === 'barMode' ? 'bar' : 'pie';
    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.itemData = processedData;
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

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getPercentage = (value) => (value / this.totalItems * 100).toFixed(2);

  resizeHelper = () => {
    const { intl } = this.props;
    const passedTranslations = intl.formatMessage(messages.Passed);
    const failedTranslations = intl.formatMessage(messages.Failed);
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
      if (d.id === passedTranslations && x < 5) x = 5;
      if (d.id === failedTranslations && x + textBox.width > barBox.x + barBox.width)
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
    const name = d[0].name;
    const number = parseInt(d[0].value, 10);
    const id = d[0].id;

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <TooltipPassingContent
          launchNumber={number}
          launchPercent={this.getPercentage(number)}
          color={color(id)}
          itemName={name}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    return (
      this.state.isConfigReady && (
        <C3Chart
          config={this.config}
          onChartCreated={this.onChartCreated}
          className={this.props.widget.contentParameters.widgetOptions.viewMode[0]}
        >
          <Legend
            isPreview={this.props.isPreview}
            items={this.itemData.itemNames}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            widgetName={this.props.widget.name}
            colors={this.config.data.colors}
          />
        </C3Chart>
      )
    );
  }
}
