import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as d3 from 'd3-selection';
import ReactDOMServer from 'react-dom/server';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { defectTypesSelector } from 'controllers/project';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import {
  getDefectTypeLocators,
  getItemColor,
  getItemName,
  getItemNameConfig,
} from '../common/utils';
import { C3Chart } from '../common/c3chart';
import { TooltipWrapper, TooltipContent } from '../common/tooltip';
import { Legend } from '../common/legend';
import styles from './launchesComparisonChart.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
  },
});

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    getDefectLink: (params) => defectLinkSelector(state, params),
    getStatisticsLink: (name) => statisticsLinkSelector(state, { statuses: [name] }),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchesComparisonChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    project: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
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

    this.props.uncheckedLegendItems.forEach((id) => {
      this.chart.toggle(id);
    });

    this.node.addEventListener('mousemove', this.setupCoords);

    // eslint-disable-next-line func-names
    d3.selectAll(document.querySelectorAll('.c3-chart-bar path')).each(function() {
      const elem = d3.select(this);
      if (elem.datum().value === 0) {
        elem.style('stroke-width', '3px');
      }
    });
  };

  onMouseOut = () => {
    this.chart.revert();
  };

  onMouseOver = (id) => {
    this.chart.focus(id);
  };

  onClickLegendItem = (id) => {
    this.props.onChangeLegend(id);
    this.chart.toggle(id);
  };

  onChartClick = (data) => {
    const { widget, getDefectLink, getStatisticsLink, defectTypes } = this.props;

    const nameConfig = getItemNameConfig(data.id);
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = defectLocators
      ? getDefectLink({ defects: defectLocators, itemId: id })
      : getStatisticsLink(nameConfig.defectType.toUpperCase());
    this.props.navigate(Object.assign(link, defaultParams));
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.project,
      filterId: 'all',
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

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
    const { widget, intl, isPreview, container } = this.props;
    const data = widget.content.result;
    const chartData = {};
    const chartDataOrdered = [];
    const colors = {};
    const contentFields = widget.contentParameters.contentFields;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.itemData = [];

    contentFields.forEach((key) => {
      const keyConfig = getItemNameConfig(key);
      chartData[key] = [key];
      colors[key] = getItemColor(keyConfig, this.props.defectTypes);
    });

    data.forEach((item) => {
      this.itemData.push({
        id: item.id,
        name: item.name,
        number: item.number,
        startTime: item.startTime,
      });
      Object.keys(item.values).forEach((key) => {
        const val = item.values[key];
        chartData[key].push(val);
      });
    });

    contentFields.forEach((key) => {
      if (key === 'statistics$executions$total') {
        return;
      }
      chartDataOrdered.push(chartData[key]);
    });

    this.itemNames = chartDataOrdered.map((item) => item[0]);

    this.config = {
      data: {
        columns: chartDataOrdered,
        type: 'bar',
        onclick: this.onChartClick,
        order: null,
        colors,
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
          categories: this.itemData.map((item) => `#${item.number}`),
          tick: {
            centered: true,
            inner: true,
            outer: false,
          },
          lines: [{ value: 5, text: 'Label', class: 'color-grid' }],
        },
        y: {
          show: !isPreview,
          padding: {
            top: 0,
          },
          max: 100,
          label: {
            text: `% ${intl.formatMessage(messages.ofTestCases)}`,
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
    const {
      intl: { formatMessage },
      defectTypes,
    } = this.props;
    const id = d[0].id;

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <TooltipContent
          launchName={name}
          launchNumber={number}
          startTime={Number(startTime)}
          itemCases={`${d[0].value}%`}
          color={color(id)}
          itemName={getItemName(getItemNameConfig(id), defectTypes, formatMessage, true)}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    return (
      this.state.isConfigReady && (
        <div className={cx('launches-comparison-chart')}>
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!this.props.isPreview && (
              <Legend
                items={this.itemNames}
                uncheckedLegendItems={this.props.uncheckedLegendItems}
                noTotal
                onClick={this.onClickLegendItem}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
              />
            )}
          </C3Chart>
        </div>
      )
    );
  }
}
