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
import { injectIntl } from 'react-intl';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { userFiltersSelector } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import {
  getItemNameConfig,
  getChartDefaultProps,
  getDefaultTestItemLinkParams,
} from 'components/widgets/common/utils';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getConfig } from './config/getConfig';
import { isSmallDonutChartView } from './config/utils';
import styles from './donutChart.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    project: activeProjectSelector(state),
    launchFilters: userFiltersSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
export class DonutChart extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    navigate: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
    onStatusPageMode: PropTypes.bool,
    launchFilters: PropTypes.array,
    heightOffset: PropTypes.number,
    getLink: PropTypes.func,
    configParams: PropTypes.object,
    chartText: PropTypes.string,
  };

  static defaultProps = {
    isPreview: false,
    uncheckedLegendItems: [],
    onStatusPageMode: false,
    launchFilters: [],
    configParams: {},
    heightOffset: 0,
    chartText: '',
    onChangeLegend: () => {},
    getLink: () => {},
  };

  componentWillUnmount() {
    this.chart = null;
  }

  onChartCreated = (node, chart) => {
    this.node = node;
    this.chart = chart;

    const { onStatusPageMode, chartText } = this.props;

    if (!onStatusPageMode) {
      const height = this.getChartSize().height;
      this.chart.resize({ height });
    }

    this.renderTotalLabel();

    d3.select(chart.element)
      .select('.c3-chart-arcs-title')
      .attr('dy', onStatusPageMode ? -5 : -15)
      .append('tspan')
      .attr('dy', onStatusPageMode || this.checkIfTheSmallView() ? 15 : 30)
      .attr('x', 0)
      .attr('fill', '#666')
      .text(chartText);

    this.forceUpdateChart();
  };

  onChartClick = (d) => {
    const {
      widget: {
        appliedFilters,
        contentParameters,
        content: { result = [] },
      },
      launchFilters,
      getLink,
      project,
    } = this.props;

    const nameConfig = getItemNameConfig(d.id);
    const id = (result[0] || result).id;
    let navigationParams;
    let linkParams = {};

    if (!id) {
      const appliedWidgetFilterId = appliedFilters[0].id;
      const launchesLimit = contentParameters.itemsCount;
      const isLatest = contentParameters.widgetOptions.latest;
      const activeFilter = launchFilters.filter((filter) => filter.id === appliedWidgetFilterId)[0];
      const activeFilterId = (activeFilter && activeFilter.id) || appliedWidgetFilterId;

      linkParams = {
        isListType: true,
        launchesLimit,
        isLatest,
      };
      navigationParams = this.getDefaultItemsTypeListLinkParams(activeFilterId);
    } else {
      linkParams = {
        isListType: false,
        itemId: id,
      };
      navigationParams = getDefaultTestItemLinkParams(project, ALL, id);
    }
    const link = getLink(nameConfig, linkParams);

    this.props.navigate(Object.assign(link, navigationParams));
  };

  getDefaultItemsTypeListLinkParams = (activeFilterId) => ({
    payload: {
      projectId: this.props.project,
      filterId: activeFilterId,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
  });

  getConfigData = () => {
    const {
      intl: { formatMessage },
      widget: { contentParameters },
      configParams = {},
      onStatusPageMode,
    } = this.props;

    return {
      getConfig,
      formatMessage,
      configParams,
      contentFields: contentParameters.contentFields,
      onChartClick: onStatusPageMode ? undefined : this.onChartClick,
      onRendered: this.renderTotalLabel,
    };
  };

  getChartSize = () => {
    const { container, heightOffset } = this.props;

    return {
      height: container.offsetHeight - heightOffset,
      width: container.offsetWidth,
    };
  };

  checkIfTheSmallView = () => {
    const size = this.getChartSize();

    return size ? isSmallDonutChartView(size.height, size.width) : false;
  };

  forceUpdateChart = () => {
    this.forceUpdate();
  };

  renderTotalLabel = () => {
    if (this.node && this.chart) {
      const titleNode = this.node.querySelector('.c3-chart-arcs-title').childNodes[0];
      titleNode.textContent = this.chart.data
        .shown()
        .reduce((acc, dataItem) => acc + dataItem.values[0].value, 0);
    }
  };

  render() {
    const { uncheckedLegendItems, onChangeLegend, onStatusPageMode } = this.props;
    const legendConfig = {
      showLegend: !onStatusPageMode,
      onChangeLegend,
      uncheckedLegendItems,
    };

    return (
      <div
        className={cx('donut-chart', {
          'status-page-mode': onStatusPageMode,
        })}
      >
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          configData={this.getConfigData()}
          legendConfig={legendConfig}
          chartCreatedCallback={this.onChartCreated}
          className={cx({ 'small-view': this.checkIfTheSmallView() })}
          resizedCallback={this.forceUpdateChart}
        />
      </div>
    );
  }
}
