/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { CHART_OFFSET } from 'components/widgets/common/constants';
import { messages } from 'components/widgets/common/messages';
import { getConfig, calculateTooltipParams } from '../common/statusPageChartConfig';
import { IssueTypeStatTooltip } from '../common/issueTypeStatTooltip';
import styles from './issuesStatusPageChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class IssuesStatusPageChart extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    height: PropTypes.number,
    interval: PropTypes.string,
  };

  static defaultProps = {
    height: 0,
    interval: null,
  };

  componentWillUnmount() {
    this.removeChartListeners();
    this.chart = null;
  }

  onChartCreated = (node, chart, chartData) => {
    this.chart = chart;
    this.node = node;
    this.chartData = chartData;
    this.interactElems = d3.selectAll(this.node.querySelectorAll('.c3-area'));

    this.createInteractiveTooltip();
  };

  onItemMouseOver = () => this.tooltip.style('display', 'block');

  onItemMouseOut = () => this.tooltip.style('display', 'none');

  onItemMouseMove = (data) => {
    const { formatMessage } = this.props.intl;
    const rectWidth = this.node.querySelectorAll('.c3-event-rect')[0].getAttribute('width');
    const currentMousePosition = d3.mouse(this.chart.element);
    const itemWidth = rectWidth / data.values.length;
    const dataIndex = Math.trunc((currentMousePosition[0] - CHART_OFFSET) / itemWidth);
    const selectedLaunchData = data.values.find((item) => item.index === dataIndex);
    const renderTooltip = createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
      itemsData: this.chartData.itemsData,
      wrapperClassName: cx('tooltip-container'),
      casesText: formatMessage(messages.cases),
      formatMessage,
    });

    this.tooltip
      .html(() => renderTooltip(selectedLaunchData, null, null, (id) => this.chartData.colors[id]))
      .style('left', `${currentMousePosition[0] - 90}px`)
      .style('top', `${currentMousePosition[1] - 50}px`);
  };

  getConfigData = () => {
    const {
      intl: { formatMessage },
      interval,
    } = this.props;

    return {
      getConfig,
      formatMessage,
      interval,
      chartType: MODES_VALUES[CHART_MODES.AREA_VIEW],
      isPointsShow: false,
      isCustomTooltip: true,
    };
  };

  removeChartListeners = () => {
    this.interactElems && this.interactElems.on('click mousemove mouseover mouseout', null);
  };

  createInteractiveTooltip = () => {
    this.tooltip = d3.select(this.node.querySelector('.c3-tooltip-container'));

    this.interactElems &&
      this.interactElems
        .on('mousemove', this.onItemMouseMove)
        .on('mouseover', this.onItemMouseOver)
        .on('mouseout', this.onItemMouseOut);
  };

  render() {
    return (
      <ChartContainer
        {...getChartDefaultProps(this.props)}
        legendConfig={{
          showLegend: false,
        }}
        className={cx('issues-status-page-chart')}
        configData={this.getConfigData()}
        chartCreatedCallback={this.onChartCreated}
        isCustomTooltip
      />
    );
  }
}
