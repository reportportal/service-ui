import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import ReactDOMServer from 'react-dom/server';
import classNames from 'classnames/bind';
import { COLOR_FAILEDSKIPPEDTOTAL } from 'common/constants/colors';
import { messages } from '../common/messages';
import { C3Chart } from '../common/c3chart';
import { TooltipWrapper, TooltipContent } from '../common/tooltip';
import { Legend } from '../common/legend';
import { getLaunchAxisTicks } from '../common/utils';
import styles from './nonPassedTestCasesTrendChart.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  nonPassedCases: {
    id: 'NonPassedTestCasesTrendChart.nonPassedCases',
    defaultMessage: 'of non-passed cases',
  },
});

const FAILED_SKIPPED_TOTAL = '% (Failed+Skipped)/Total';
const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';

@injectIntl
export class NonPassedTestCasesTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
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
      return;
    }

    this.resizeChart();

    this.node.addEventListener('mousemove', this.setupCoords);
  };

  getConfig = () => {
    const { widget, intl, isPreview } = this.props;

    this.chartData = ['notPassed'];
    this.itemData = [];

    widget.content.result.forEach((item) => {
      const value = parseFloat(item.values[FAILED_SKIPPED_TOTAL]);
      const { id, name, number, startTime } = item;
      this.itemData.push({ id, name, number, startTime });
      this.chartData.push(value);
    });

    this.config = {
      data: {
        columns: [this.chartData],
        colors: {
          notPassed: COLOR_FAILEDSKIPPEDTOTAL,
        },
      },
      point: {
        sensitivity: 1000,
        r: this.itemData.length === 1 ? 5 : 1,
        focus: {
          expand: {
            r: 5,
          },
        },
      },
      grid: {
        y: {
          show: !isPreview,
        },
      },
      axis: {
        x: {
          show: !isPreview,
          type: 'category',
          categories: this.itemData.map((item) => `# ${item.number}`),
          tick: {
            values: getLaunchAxisTicks(this.itemData.length),
            width: 60,
            centered: true,
            inner: true,
            multiline: false,
            outer: false,
          },
        },
        y: {
          show: !isPreview,
          max: 100,
          min: 0,
          padding: {
            top: 5,
            bottom: 0,
          },
          label: {
            text: `% ${intl.formatMessage(localMessages.nonPassedCases)}`,
            position: 'outer-middle',
          },
        },
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 85,
        left: isPreview ? 0 : 60,
        right: isPreview ? 0 : 20,
        bottom: 0,
      },
      legend: {
        show: false, // we use custom legend
      },
      tooltip: {
        grouped: true,
        position: this.getPosition,
        contents: this.renderContents,
      },
    };
    this.setState({
      isConfigReady: true,
    });
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

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
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
  };

  renderContents = (d, defaultTitleFormat, defaultValueFormat, color) => {
    const { name, number, startTime } = this.itemData[d[0].index];
    const id = d[0].id;

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <TooltipContent
          launchName={name}
          launchNumber={number}
          startTime={startTime}
          itemCases={d[0].value}
          color={color(id)}
          itemName={this.props.intl.formatMessage(messages.failedSkippedTotal)}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    const { isPreview } = this.props;
    const classes = cx('non-passed-cases-trend-chart', {
      'preview-view': isPreview,
    });
    return (
      <div className={classes}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!isPreview && <Legend items={[FAILED_SKIPPED_STATISTICS_KEY]} disabled />}
          </C3Chart>
        )}
      </div>
    );
  }
}
