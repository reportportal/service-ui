import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import classNames from 'classnames/bind';
import { COLOR_FAILED } from 'common/constants/colors';
import { STATS_FAILED } from 'common/constants/statistics';
import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/statusLocalization';

import { TooltipWrapper } from '../common/tooltip';
import { C3Chart } from '../common/c3chart';
import { Legend } from '../common/legend';
import { getLaunchAxisTicks } from '../common/utils';
import { getTicks } from './configuration';
import { FailedCasesTooltipContent } from './failedCasesTooltipContent';
import styles from './failedCasesTrendChart.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  failedCases: {
    id: 'FailedCasesTrendChart.label.failedCases',
    defaultMessage: 'failed cases',
  },
  cases: {
    id: 'FailedCasesTrendChart.tooltip.cases',
    defaultMessage: 'cases',
  },
});

@injectIntl
@connect((state) => ({
  project: activeProjectSelector(state),
}))
export class FailedCasesTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    project: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object.isRequired,
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
    this.node.removeEventListener('mousemove', this.updateCoords);
    this.props.observer.unsubscribe('widgetResized', this.resizeChart);
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.resizeChart();

    this.node.addEventListener('mousemove', this.updateCoords);
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.project,
      filterId: 'all',
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

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
        startTime: item.start_time,
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
            text: intl.formatMessage(messages.failedCases),
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

  updateCoords = ({ pageX, pageY }) => {
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
        <FailedCasesTooltipContent
          launchName={name}
          launchNumber={number}
          startTime={Number(startTime)}
          itemCases={d[0].value}
          itemCasesSuffix={this.props.intl.formatMessage(messages.cases)}
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
            {!isPreview && (
              <Legend
                items={[STATS_FAILED]}
                onClick={this.onClick}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
              />
            )}
          </C3Chart>
        )}
      </div>
    );
  }
}
