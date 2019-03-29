import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { COLOR_FAILED } from 'common/constants/colors';
import { STATS_FAILED } from 'common/constants/statistics';
import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/statusLocalization';
import { messages } from '../common/messages';
import { TooltipWrapper, TooltipContent } from '../common/tooltip';
import { C3Chart } from '../common/c3chart';
import { Legend } from '../common/legend';
import { getLaunchAxisTicks } from '../common/utils';
import { getTicks } from './configuration';
import styles from './failedCasesTrendChart.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  failedCasesLabel: {
    id: 'FailedCasesTrendChart.failedCases',
    defaultMessage: 'failed cases',
  },
});

@injectIntl
export class FailedCasesTrendChart extends Component {
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

    this.chartData = ['failed'];
    this.itemData = [];
    let topExtremum = 0;
    let bottomExtremum = Infinity;

    widget.content.result.forEach((item) => {
      if (+item.values.total > topExtremum) {
        topExtremum = +item.values.total;
      }
      if (+item.values.total < bottomExtremum) {
        bottomExtremum = +item.values.total;
      }
      this.itemData.push({
        id: item.id,
        name: item.name,
        number: item.number,
        startTime: item.startTime,
      });
      this.chartData.push(item.values.total);
    });

    this.config = {
      data: {
        columns: [this.chartData],
        colors: {
          failed: COLOR_FAILED,
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
          tick: {
            values: getTicks(bottomExtremum, topExtremum),
            outer: false,
          },
          padding: {
            top: 5,
            bottom: 0,
          },
          label: {
            text: intl.formatMessage(localMessages.failedCasesLabel),
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
          startTime={Number(startTime)}
          itemCases={`${d[0].value} ${this.props.intl.formatMessage(messages.cases)}`}
          color={color(id)}
          itemName={this.props.intl.formatMessage(statusLocalization[FAILED])}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    const { isPreview } = this.props;
    const classes = cx('failed-cases-trend-chart', {
      'preview-view': isPreview,
    });
    return (
      <div className={classes}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!isPreview && <Legend items={[STATS_FAILED]} disabled />}
          </C3Chart>
        )}
      </div>
    );
  }
}
