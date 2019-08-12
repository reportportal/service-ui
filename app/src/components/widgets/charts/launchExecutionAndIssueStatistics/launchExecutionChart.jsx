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
import isEqual from 'fast-deep-equal';
import ReactDOMServer from 'react-dom/server';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { launchFiltersSelector } from 'controllers/filter';
import { TEST_ITEM_PAGE, PROJECT_LAUNCHES_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';
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
    getStatisticsLink: statisticsLinkSelector(state),
    launchFilters: launchFiltersSelector(state),
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
    onStatusPageMode: PropTypes.bool,
    launchFilters: PropTypes.array,
    launchNameBlockHeight: PropTypes.number,
  };

  static defaultProps = {
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
    onStatusPageMode: false,
    launchFilters: [],
    launchNameBlockHeight: 0,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    const { observer, isPreview } = this.props;

    !isPreview && observer.subscribe && observer.subscribe('widgetResized', this.resizeStatusChart);

    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    const { observer, isPreview } = this.props;

    if (!isPreview) {
      this.statusNode && this.statusNode.removeEventListener('mousemove', this.setCoords);

      observer.unsubscribe && observer.unsubscribe('widgetResized', this.resizeStatusChart);
    }
    this.chart = null;
  }

  onStatusChartCreated = (chart, element) => {
    this.chart = chart;
    this.statusNode = element;

    const { onStatusPageMode, widget, isPreview, uncheckedLegendItems } = this.props;

    this.renderTotalLabel();

    if (!widget.content.result || isPreview) {
      return;
    }

    if (!onStatusPageMode) {
      this.chart.resize({
        height: this.height,
      });
    }

    uncheckedLegendItems.forEach((id) => {
      this.chart.toggle(id);
    });

    d3
      .select(chart.element)
      .select('.c3-chart-arcs-title')
      .attr('dy', onStatusPageMode ? -5 : -15)
      .append('tspan')
      .attr('dy', onStatusPageMode ? 15 : 30)
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
    const { widget, launchFilters, getStatisticsLink } = this.props;

    const nameConfig = getItemNameConfig(d.id);
    const id = getResult(widget).id;
    let navigationParams;

    if (!id) {
      const appliedWidgetFilterId = widget.appliedFilters[0].id;
      const activeFilter = launchFilters.filter((filter) => filter.id === appliedWidgetFilterId)[0];
      const activeFilterId = activeFilter && activeFilter.id;
      navigationParams = this.getDefaultParamsOverallStatisticsWidget(activeFilterId);
    } else {
      const link = getStatisticsLink({ statuses: [nameConfig.defectType.toUpperCase()] });
      navigationParams = Object.assign(link, this.getDefaultParamsLaunchExecutionWidget(id));
    }

    this.props.navigate(navigationParams);
  };

  getDefaultParamsOverallStatisticsWidget = (activeFilterId) => ({
    payload: {
      projectId: this.props.project,
      filterId: activeFilterId || ALL,
    },
    type: PROJECT_LAUNCHES_PAGE,
  });

  getDefaultParamsLaunchExecutionWidget = (id) => ({
    payload: {
      projectId: this.props.project,
      filterId: ALL,
      testItemIds: id,
    },
    type: TEST_ITEM_PAGE,
  });

  getConfig = () => {
    const EXECUTIONS = '$executions$';
    const { widget, container, isPreview, onStatusPageMode, launchNameBlockHeight } = this.props;
    const values = getResult(widget).values;
    const statusDataItems = getChartData(values, EXECUTIONS);
    const statusChartData = statusDataItems.itemTypes;
    const statusChartColors = statusDataItems.itemColors;
    const statusChartDataOrdered = [];

    this.height = container.offsetHeight - launchNameBlockHeight;
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
          show: !isPreview,
        },
      },
      tooltip: {
        grouped: false,
        position: this.getStatusPosition,
        contents: this.renderStatusContents,
      },
      onrendered: this.renderTotalLabel,
    };

    if (!onStatusPageMode) {
      this.statusConfig.data.onclick = this.onChartClick;
    }

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
    const newHeight = this.props.container.offsetHeight - this.props.launchNameBlockHeight;
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

  renderTotalLabel = () => {
    if (this.chart) {
      const total = this.chart.data
        .shown()
        .reduce((acc, dataItem) => acc + dataItem.values[0].value, 0);

      this.statusNode.querySelector('.c3-chart-arcs-title').childNodes[0].textContent = total;
    }
  };

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
    const { isPreview, uncheckedLegendItems, onStatusPageMode } = this.props;
    const classes = chartCx('container', { 'preview-view': isPreview });
    const chartClasses = chartCx('c3', { 'small-view': this.height <= 250 });
    const legendItems = this.statusItems.map((item) => item.id);

    return (
      <div className={classes}>
        {isConfigReady && (
          <div
            className={chartCx('launch-execution-chart', {
              'status-page-mode': onStatusPageMode,
            })}
          >
            <div className={chartCx('data-js-launch-execution-chart-container')}>
              {!isPreview &&
                !onStatusPageMode && (
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
