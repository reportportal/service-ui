import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import ReactDOMServer from 'react-dom/server';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { COLOR_CHART_DURATION, COLOR_FAILED } from 'common/constants/colors';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ALL } from 'common/constants/reservedFilterIds';
import { isValueInterrupted, transformCategoryLabel, getLaunchAxisTicks } from '../common/utils';
import { C3Chart } from '../common/c3chart';
import { LaunchDurationTooltip } from './launchDurationTooltip';
import { prepareChartData } from './prepareChartData';
import { DURATION } from './constants';
import styles from './launchesDurationChart.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchesDurationChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
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

  componentDidUpdate(prevProps) {
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

  onChartClick = (data) => {
    const { projectId } = this.props;

    this.props.navigate({
      type: TEST_ITEM_PAGE,
      payload: {
        projectId,
        filterId: ALL,
        testItemIds: `${this.itemData[data.index].id}`,
      },
    });
  };

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.resizeChart();

    this.node.addEventListener('mousemove', this.setupCoords);
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

  getConfig = () => {
    const { widget, isPreview, container } = this.props;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    const { timeType, chartData, itemData = [] } = prepareChartData(widget);
    this.itemData = itemData;
    this.timeType = timeType;

    this.config = {
      data: {
        columns: [chartData],
        type: 'bar',
        onclick: this.onChartClick,
        colors: {
          [DURATION]: COLOR_CHART_DURATION,
        },
        groups: [[DURATION]],
        color: (color, d) => {
          if (itemData[d.index] && isValueInterrupted(itemData[d.index])) {
            return COLOR_FAILED;
          }
          return color;
        },
      },
      grid: {
        y: {
          show: !isPreview,
        },
      },
      axis: {
        rotated: true,
        x: {
          show: !isPreview,
          type: 'category',
          categories: itemData.map(transformCategoryLabel),
          tick: {
            values: getLaunchAxisTicks(itemData.length),
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
            format: (d) => (parseInt(d, 10) / timeType.value).toFixed(2),
          },
          padding: {
            top: 0,
            bottom: 0,
          },
          label: {
            text: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.SECONDS),
            position: 'outer-center',
          },
        },
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 20,
        left: isPreview ? 0 : 40,
        right: isPreview ? 0 : 20,
        bottom: isPreview ? 0 : 10,
      },
      legend: {
        show: false,
      },
      tooltip: {
        grouped: true,
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

  renderContents = (d) => {
    const launchData = this.itemData[d[0].index];
    return ReactDOMServer.renderToStaticMarkup(
      <LaunchDurationTooltip launchData={launchData} timeType={this.timeType} />,
    );
  };

  render() {
    const { isPreview } = this.props;
    const classes = cx('launches-duration-chart', {
      'isPreview-view': isPreview,
    });
    return (
      <div className={classes}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated} />
        )}
      </div>
    );
  }
}
