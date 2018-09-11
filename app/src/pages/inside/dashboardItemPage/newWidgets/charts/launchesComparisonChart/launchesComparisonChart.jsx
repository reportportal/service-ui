import React, { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { activeProjectSelector } from 'controllers/user';
import { redirect } from 'redux-first-router';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import * as d3 from 'd3-selection';
import { C3Chart } from '../../c3chart';
import { renderTooltip } from '../../tooltip';
import styles from './launchesComparisonChart.scss';
import { chartConfigs } from '../../chartConfigs';

const cx = classNames.bind(styles);

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
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
  };

  componentWillUnmount() {
    this.node.removeEventListener('mousemove', this.getCoords);
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    const legendClassName = cx('legend');
    this.node.addEventListener('mousemove', this.getCoords);

    d3
      .select(this.node)
      .insert('div', '.chart')
      .attr('class', legendClassName)
      .insert('div', `.${legendClassName}`)
      .attr('data-js-legend-wrapper', '')
      .selectAll('span')
      .data(this.itemNames)
      .enter()
      .append('span')
      .attr('data-id', (id) => id)
      .attr('class', cx('legend-item'))
      .html((id) => {
        const color = chartConfigs.colors[id.split('$')[2]];
        const itemName = this.props.intl.formatMessage(messages[id.split('$total')[0]]);
        return `
          <span class="${cx('color-mark')}" style="background-color: ${color}"></span>
          <span class="${cx('item-name')}">${itemName}</span>`;
      })
      .on('mouseover', (id) => {
        this.chart.focus(id);
      })
      .on('mouseout', () => {
        this.chart.revert();
      });

    d3.selectAll(document.querySelectorAll('.c3-chart-bar path')).each(function() {
      const elem = d3.select(this);
      if (elem.datum().value === 0) {
        elem.style('stroke-width', '3px');
      }
    });
  };

  onChartClick = (d) => {
    const { widget, project } = this.props;

    this.props.redirect({
      type: TEST_ITEM_PAGE,
      payload: {
        projectId: project,
        filterId: 'all',
        testItemIds: widget.content.result[d.index].id,
      },
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

  getData = () => {
    const { widget, intl, isPreview } = this.props;
    const data = widget.content.result;
    const chartData = {};
    const chartDataOrdered = [];
    const colors = {};
    const contentFields = widget.content_parameters.content_fields;

    this.itemData = [];

    Object.keys(data[0].values).forEach((key) => {
      chartData[key] = [key];
      colors[key] = chartConfigs.colors[key.split('$')[2]];
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
        contents: this.contents,
      },
      size: {
        height: this.props.height,
      },
    };
  };

  getCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  contents = (d, defaultTitleFormat, defaultValueFormat, color) => {
    const { name, number, startTime } = this.itemData[d[0].index];
    const id = d[0].id;
    return renderTooltip({
      launchName: name,
      launchNumber: number,
      startTime,
      itemCases: d[0].value,
      color: color(id),
      itemName: this.props.intl.formatMessage(messages[id.split('$total')[0]]),
    });
  };

  render() {
    this.getData();

    return <C3Chart config={this.config} onChartCreated={this.onChartCreated} />;
  }
}
