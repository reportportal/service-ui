import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import * as COLORS from 'common/constants/colors';
import { STATS_PASSED } from 'common/constants/statistics';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { PASSING_RATE_PER_LAUNCH } from 'common/constants/widgetTypes';
import { C3Chart } from '../common/c3chart';
import { Legend } from '../common/legend';
import { messages } from '../common/messages';
import { getItemNameConfig, getItemName } from '../common/utils';
import { PassingRatePerLaunchTooltip } from './passingRatePerLaunchTooltip';
import styles from './passingRatePerLaunch.scss';

const cx = classNames.bind(styles);

const NOT_PASSED_STATISTICS_KEY = 'statistics$executions$notPassed';

@injectIntl
export class PassingRatePerLaunch extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentWillUnmount() {
    if (!this.props.isPreview) {
      this.node.removeEventListener('mousemove', this.setupCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    }
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
    this.resizeHelper();
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

  getProcessedData = ({ content = {}, contentParameters = {} }, isPreview, colors) => {
    const { viewMode } = contentParameters.widgetOptions;
    const itemNames = [STATS_PASSED, NOT_PASSED_STATISTICS_KEY];
    const columnData = {
      [STATS_PASSED]: Number(content.result.passed),
      [NOT_PASSED_STATISTICS_KEY]: Number(content.result.total) - Number(content.result.passed),
    };
    const columns = [
      [STATS_PASSED, columnData[STATS_PASSED]],
      [NOT_PASSED_STATISTICS_KEY, columnData[NOT_PASSED_STATISTICS_KEY]],
    ];
    const chartData = {
      columns,
      groups: [itemNames],
      type: viewMode,
      order: null,
      colors,
      labels: {
        show: !isPreview,
        format: (v, id) => (isPreview ? '' : `${this.getPercentage(columnData[id])}%`),
      },
    };

    let parameters = {};
    if (viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW]) {
      parameters = {
        bar: {
          width: {
            ratio: 0.35,
          },
        },
        padding: {
          top: isPreview ? 0 : 30,
          left: 20,
          right: 20,
          bottom: 0,
        },
        axis: {
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
        },
      };
    } else {
      parameters = {
        pie: {
          label: {
            show: !isPreview,
            threshold: 0.05,
            format: (value, r, id) => `${this.getPercentage(columnData[id])}%`,
          },
        },
        padding: {
          top: isPreview ? 0 : 85,
        },
      };
    }
    return {
      data: chartData,
      ...parameters,
    };
  };

  getConfig = () => {
    const { widget, isPreview, container } = this.props;
    const widgetData = widget.content.result;
    const colors = {};
    colors[STATS_PASSED] = COLORS.COLOR_PASSED;
    colors[NOT_PASSED_STATISTICS_KEY] = COLORS.COLOR_NOTPASSED;
    const processedData = this.getProcessedData(widget, isPreview, colors);
    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.totalItems = Number(widgetData.total);

    this.config = {
      ...processedData,
      interaction: {
        enabled: !isPreview,
      },
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
      onrendered: this.props.isPreview ? this.resizeHelper : undefined,
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

  getCustomTitle() {
    const { intl } = this.props;
    const message = this.isRatePerLaunchType() ? messages.launchName : messages.filterLabel;

    return intl.formatMessage(message);
  }

  getCustomValue() {
    const { widget } = this.props;

    return this.isRatePerLaunchType()
      ? widget.contentParameters.widgetOptions.launchNameFilter
      : widget.appliedFilters && widget.appliedFilters[0].name;
  }

  isRatePerLaunchType() {
    const { widget } = this.props;

    return widget.widgetType === PASSING_RATE_PER_LAUNCH;
  }

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
    this.resizeHelper();
  };

  resizeHelper() {
    const nodeElement = this.node;
    if (!nodeElement) {
      return;
    }
    // eslint-disable-next-line func-names
    d3.selectAll(nodeElement.querySelectorAll('.bar .c3-chart-texts .c3-text')).each(function(d) {
      const selector = `c3-target-${d.id}`;
      const barBox = d3
        .selectAll(nodeElement.getElementsByClassName(selector))
        .node()
        .getBBox();
      const textElement = d3.select(this).node();
      const textBox = textElement.getBBox();
      let x = barBox.x + barBox.width / 2 - textBox.width / 2;
      if (d.id === STATS_PASSED && x < 5) x = 5;
      if (d.id === NOT_PASSED_STATISTICS_KEY && x + textBox.width > barBox.x + barBox.width)
        x = barBox.x + barBox.width - textBox.width - 5;
      textElement.setAttribute('x', `${x}`);
    });
  }

  customBlock = (
    <div className={cx('launch-info-block')}>
      <span className={cx('launch-name-title')}>{this.getCustomTitle()}</span>
      <span className={cx('launch-name')}>{this.getCustomValue()}</span>
    </div>
  );

  renderContents = (d, defaultTitleFormat, defaultValueFormat, color) => {
    const number = Number(d[0].value);
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
    const viewMode = this.props.widget.contentParameters.widgetOptions.viewMode;

    return (
      this.state.isConfigReady && (
        <C3Chart
          config={this.config}
          onChartCreated={this.onChartCreated}
          className={`${cx('passing-rate-per-launch')} ${viewMode}`}
        >
          {!this.props.isPreview && (
            <Legend
              items={[STATS_PASSED, NOT_PASSED_STATISTICS_KEY]}
              disabled
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              customBlock={this.customBlock}
            />
          )}
        </C3Chart>
      )
    );
  }
}
