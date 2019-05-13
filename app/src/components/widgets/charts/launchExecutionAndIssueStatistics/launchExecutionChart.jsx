/*
 * Copyright 2018 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import ReactDOMServer from 'react-dom/server';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { TooltipWrapper } from '../common/tooltip';
import { C3Chart } from '../common/c3chart';
import chartStyles from './launchExecutionAndIssueStatistics.scss';
import { Legend } from '../common/legend';
import { LaunchExecutionAndIssueStatisticsTooltip } from './launchExecutionAndIssueStatisticsTooltip';
import { getPercentage, getDefectItems, getChartData } from './chartUtils';
import { messages } from './messages';
import { getItemNameConfig } from '../common/utils';

const chartCx = classNames.bind(chartStyles);
const getResult = (widget) => widget.content.result[0] || widget.content.result;

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getStatisticsLink: (name) => statisticsLinkSelector(state, { statuses: [name] }),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchExecutionChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeStatusChart);
    this.getConfig();
  }

  componentWillUnmount() {
    if (!this.props.isPreview) {
      this.statusNode.removeEventListener('mousemove', this.setCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeStatusChart);
    }
  }

  onStatusChartCreated = (chart, element) => {
    this.chart = chart;
    this.statusNode = element;

    this.renderTotalLabel();

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.chart.resize({
      height: this.height,
    });

    this.props.uncheckedLegendItems.forEach((id) => {
      this.chart.toggle(id);
    });

    d3
      .select(chart.element)
      .select('.c3-chart-arcs-title')
      .attr('dy', -15)
      .append('tspan')
      .attr('dy', 30)
      .attr('x', 0)
      .attr('fill', '#666')
      .text('SUM');

    this.statusNode.addEventListener('mousemove', this.setCoords);
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

  onChartClick = (d) => {
    const { widget, getStatisticsLink } = this.props;
    const id = getResult(widget).id;
    const defaultParams = this.getDefaultLinkParams(id);
    const nameConfig = getItemNameConfig(d.id);

    const link = getStatisticsLink(nameConfig.defectType.toUpperCase());
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

  getConfig = () => {
    const EXECUTIONS = '$executions$';
    const { widget, container, isPreview } = this.props;
    const values = getResult(widget).values;
    const statusDataItems = getChartData(values, EXECUTIONS);
    const statusChartData = statusDataItems.itemTypes;
    const statusChartColors = statusDataItems.itemColors;
    const statusChartDataOrdered = [];

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.noAvailableData = false;

    statusChartData.statistics$executions$passed &&
      statusChartDataOrdered.push([
        'statistics$executions$passed',
        statusChartData.statistics$executions$passed,
      ]);
    statusChartData.statistics$executions$failed &&
      statusChartDataOrdered.push([
        'statistics$executions$failed',
        statusChartData.statistics$executions$failed,
      ]);
    statusChartData.statistics$executions$skipped &&
      statusChartDataOrdered.push([
        'statistics$executions$skipped',
        statusChartData.statistics$executions$skipped,
      ]);

    if (
      +statusChartDataOrdered.statistics$executions$total === 0 ||
      !statusChartDataOrdered.length
    ) {
      this.noAvailableData = true;
      return;
    }

    this.statusItems = getDefectItems(statusChartDataOrdered);
    this.statusConfig = {
      data: {
        columns: statusChartDataOrdered,
        type: 'donut',
        order: null,
        colors: statusChartColors,
        onclick: this.onChartClick,
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 85,
      },
      legend: {
        show: false, // we use custom legend
        position: 'bottom',
      },
      donut: {
        title: 0,
        label: {
          show: false,
          threshold: 0.05,
        },
      },
      tooltip: {
        grouped: false,
        position: this.getStatusPosition,
        contents: this.renderStatusContents,
      },
      onrendered: () => {
        this.renderTotalLabel();
      },
    };

    this.setState({
      isConfigReady: true,
    });
  };

  setCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getStatusPosition = (d, width, height) => {
    const rect = this.statusNode.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  statusItems = [];

  resizeStatusChart = () => {
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

  renderTotalLabel() {
    if (this.chart) {
      const total = this.chart.data
        .shown()
        .reduce((acc, dataItem) => acc + dataItem.values[0].value, 0);

      this.statusNode.querySelector('.c3-chart-arcs-title').childNodes[0].textContent = total;
    }
  }

  // This function is a reimplementation of its d3 counterpart, and it needs 4 arguments of which 2 are not used here.
  // These two are named a and b in the original implementation.

  renderStatusContents = (data, a, b, color) => {
    const launchData = this.statusItems.find((item) => item.id === data[0].id);

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <LaunchExecutionAndIssueStatisticsTooltip
          launchNumber={data[0].value}
          duration={getPercentage(data[0].ratio)}
          color={color(launchData.name)}
          itemName={this.props.intl.formatMessage(messages[launchData.name.split('$total')[0]])}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    const { isConfigReady } = this.state;
    const { isPreview, uncheckedLegendItems } = this.props;
    const classes = chartCx({ 'preview-view': isPreview });
    const chartClasses = chartCx('c3', { 'small-view': this.height <= 250 });
    const legendItems = this.statusItems.map((item) => item.id);

    return (
      <div className={classes}>
        {isConfigReady && (
          <div className={chartCx('launch-execution-chart')}>
            <div className={chartCx('data-js-launch-execution-chart-container')}>
              {!isPreview && (
                <Legend
                  items={legendItems}
                  uncheckedLegendItems={uncheckedLegendItems}
                  onClick={this.onClickLegendItem}
                  onMouseOver={this.onMouseOver}
                  onMouseOut={this.onMouseOut}
                />
              )}
              <C3Chart
                config={this.statusConfig}
                onChartCreated={this.onStatusChartCreated}
                className={chartClasses}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
