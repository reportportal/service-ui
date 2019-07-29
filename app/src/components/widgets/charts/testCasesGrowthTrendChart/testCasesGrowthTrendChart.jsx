import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux';
import moment from 'moment';
import * as d3 from 'd3-selection';
import isEqual from 'fast-deep-equal';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { dateFormat } from 'common/utils/timeDateUtils';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import * as COLORS from 'common/constants/colors';
import * as STATUSES from 'common/constants/testStatuses';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { messages } from '../common/messages';
import { C3Chart } from '../common/c3chart';
import { TooltipWrapper } from '../common/tooltip';
import { getLaunchAxisTicks, getTimelineAxisTicks } from '../common/utils';
import styles from './testCasesGrowthTrendChart.scss';

const cx = classNames.bind(styles);

const localMessages = defineMessages({
  growTestCases: {
    id: 'Widgets.growtestCases',
    defaultMessage: 'Grow test cases',
  },
  totalTestCases: {
    id: 'Widgets.totalTestCases',
    defaultMessage: 'Total test cases',
  },
});

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class TestCasesGrowthTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    project: PropTypes.string.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
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

  componentDidUpdate(prevProps) {
    this.onChartRendered();
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    if (!this.props.isPreview) {
      this.node.removeEventListener('mousemove', this.setupCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    }
    this.chart = null;
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    this.node.addEventListener('mousemove', this.setupCoords);
  };

  onChartClick = (d) => {
    if (this.isTimeLine) {
      return;
    }

    const { widget, getStatisticsLink } = this.props;
    const id = widget.content.result[d.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const statisticsLink = getStatisticsLink({
      statuses: [STATUSES.PASSED, STATUSES.FAILED, STATUSES.SKIPPED, STATUSES.INTERRUPTED],
    });
    this.props.navigate(Object.assign(statisticsLink, defaultParams));
  };

  onChartRendered = () => {
    const barPathSelector = '.c3-bars-bar path';
    const barPaths = d3.select(this.node).selectAll(barPathSelector);
    barPaths.each((pathData, i) => {
      const elem = d3.select(this.node).select(`${barPathSelector}.c3-bar-${i}`);
      if (pathData.value === 0) {
        elem
          .style('stroke-width', '1px')
          .style('stroke', '#464547')
          .style('shape-rendering', 'initial');
      }
    });
  };

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
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
    const { widget, intl, isPreview, container } = this.props;
    this.isTimeLine =
      widget.contentParameters &&
      widget.contentParameters.widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];

    let data;

    if (this.isTimeLine) {
      data = Object.keys(widget.content.result).map((key) => ({
        date: key,
        ...widget.content.result[key],
      }));
    } else {
      data = widget.content.result;
    }
    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.itemData = [];

    const offsets = ['offset'];
    const bars = ['bar'];
    this.positiveTrend = [];

    data.forEach((item) => {
      const { values } = item;
      if (+values.delta < 0) {
        this.positiveTrend.push(false);
        offsets.push(+values.statistics$executions$total);
      } else {
        this.positiveTrend.push(true);
        offsets.push(+values.statistics$executions$total - +values.delta);
      }
      bars.push(Math.abs(+values.delta));

      if (this.isTimeLine) {
        this.itemData.push({ date: item.date });
      } else {
        this.itemData.push({
          id: item.id,
          name: item.name,
          number: item.number,
          startTime: item.startTime,
        });
      }
    });

    this.config = {
      data: {
        columns: [offsets, bars],
        type: MODES_VALUES[CHART_MODES.BAR_VIEW],
        order: null,
        groups: [['offset', 'bar']],
        onclick: this.onChartClick,
        color: (c, d) => {
          let color;
          switch (d.id) {
            case 'bar':
              if (this.positiveTrend[d.index]) {
                color = COLORS.COLOR_DARK_PASTEL_GREEN;
                break;
              }
              color = COLORS.COLOR_ORANGE_RED;
              break;
            default:
              color = null;
              break;
          }
          return color;
        },
        labels: {
          format: (v, id, i) => {
            let step = this.itemData.length < 20 ? 1 : 2;
            if (this.isTimeLine && this.itemData.length >= 20) {
              step = 6;
            }

            if (isPreview || id !== 'bar' || i % step !== 0) {
              return null;
            }
            return this.positiveTrend[i] ? v : -v;
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
          categories: this.itemData.map((item) => {
            let day;
            if (this.isTimeLine) {
              day = moment(item.date)
                .format('dddd')
                .substring(0, 3);
              return `${day}, ${item.date}`;
            }
            return `#${item.number}`;
          }),
          tick: {
            values: this.isTimeLine
              ? getTimelineAxisTicks(this.itemData.length)
              : getLaunchAxisTicks(this.itemData.length),
            width: 60,
            centered: true,
            inner: true,
            outer: false,
            multiline: this.isTimeLine,
          },
        },
        y: {
          show: !isPreview,
          padding: {
            top: 10,
            bottom: 0,
          },
          label: {
            text: `${intl.formatMessage(messages.cases)}`,
            position: 'outer-middle',
          },
        },
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 10,
        left: isPreview ? 0 : 60,
        right: isPreview ? 0 : 20,
        bottom: isPreview || !this.isTimeLine ? 0 : 10,
      },
      legend: {
        show: false,
      },
      size: {
        height: this.height,
      },
      tooltip: {
        grouped: true,
        position: this.getTooltipPosition,
        contents: this.renderTooltip,
      },
      onrendered: this.onChartRendered,
    };

    this.setState({
      isConfigReady: true,
    });
  };

  getTooltipPosition = (d, width, height) => {
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
      });
      this.height = newHeight;
      this.config.size.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
    }
  };

  renderTooltip = (d) => {
    const { name, number, startTime, date } = this.itemData[d[0].index];

    let total;
    let growth;
    if (this.positiveTrend[d[0].index]) {
      growth = d[1].value;
      total = d[0].value + d[1].value;
    } else {
      growth = -d[1].value;
      total = d[0].value;
    }

    const growthClass = classNames({
      increase: growth > 0,
      decrease: growth < 0,
    });

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        {!this.isTimeLine && <div className={cx('launch-name')}>{`${name} #${number}`}</div>}
        <div className={cx('launch-start-time', { 'timeline-mode': this.isTimeLine })}>
          {this.isTimeLine ? date : dateFormat(Number(startTime))}
        </div>
        <div className={cx('item-wrapper')}>
          <div className={cx('item-cases')}>
            <div className={cx('item-cases-growth')}>
              {this.props.intl.formatMessage(localMessages.growTestCases)}:{' '}
              <span className={cx(growthClass)}>{growth}</span>
            </div>
            <div className={cx('item-cases-total')}>
              {this.props.intl.formatMessage(localMessages.totalTestCases)}: <span>{total}</span>
            </div>
          </div>
        </div>
      </TooltipWrapper>,
    );
  };

  render() {
    return (
      <div className={cx('test-cases-growth-trend-chart')}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated} />
        )}
      </div>
    );
  }
}
