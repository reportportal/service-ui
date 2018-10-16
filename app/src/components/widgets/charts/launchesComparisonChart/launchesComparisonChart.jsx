import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import * as d3 from 'd3-selection';
import ReactDOMServer from 'react-dom/server';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import * as COLORS from 'common/constants/colors';
import { chartConfigs } from 'common/constants/chartConfigs';
import { C3Chart } from '../common/c3chart';
import { TooltipWrapper, TooltipContent } from '../common/tooltip';
import { Legend } from '../common/legend';
import './launchesComparisonChart.scss';

const messages = defineMessages({
  statistics$executions$total: {
    id: 'FilterNameById.statistics$executions$total',
    defaultMessage: 'Total',
  },
  statistics$executions$passed: {
    id: 'FilterNameById.statistics$executions$passed',
    defaultMessage: 'Passed',
  },
  statistics$executions$failed: {
    id: 'FilterNameById.statistics$executions$failed',
    defaultMessage: 'Failed',
  },
  statistics$executions$skipped: {
    id: 'FilterNameById.statistics$executions$skipped',
    defaultMessage: 'Skipped',
  },
  statistics$defects$product_bug: {
    id: 'FilterNameById.statistics$defects$product_bug',
    defaultMessage: 'Product bug',
  },
  statistics$defects$automation_bug: {
    id: 'FilterNameById.statistics$defects$automation_bug',
    defaultMessage: 'Automation bug',
  },
  statistics$defects$system_issue: {
    id: 'FilterNameById.statistics$defects$system_issue',
    defaultMessage: 'System issue',
  },
  statistics$defects$no_defect: {
    id: 'FilterNameById.statistics$defects$no_defect',
    defaultMessage: 'No defect',
  },
  statistics$defects$to_investigate: {
    id: 'FilterNameById.statistics$defects$to_investigate',
    defaultMessage: 'To investigate',
  },
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
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
export class LaunchesComparisonChart extends Component {
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
      return;
    }

    this.node.addEventListener('mousemove', this.getCoords);

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

  onClick = (id) => {
    this.chart.toggle(id);
  };

  onChartClick = (d) => {
    const { widget, getDefectLink, getStatisticsLink } = this.props;
    const name = d.id.split('$')[2];
    const id = widget.content.result[d.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectLocator = chartConfigs.defectLocators[name];
    const link = defectLocator
      ? getDefectLink({ defects: [defectLocator], itemId: id })
      : getStatisticsLink(name);

    this.props.redirect(Object.assign(link, defaultParams));
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
    const contentFields = widget.content_parameters.content_fields;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.itemData = [];

    Object.keys(data[0].values).forEach((key) => {
      const testName = key.split('$')[2].toUpperCase();
      chartData[key] = [key];
      colors[key] = COLORS[`COLOR_${testName}`];
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

  getCoords = ({ pageX, pageY }) => {
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
          itemCases={d[0].value}
          color={color(id)}
          itemName={this.props.intl.formatMessage(messages[id.split('$total')[0]])}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    return (
      this.state.isConfigReady && (
        <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
          <Legend
            items={this.itemNames}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
          />
        </C3Chart>
      )
    );
  }
}
