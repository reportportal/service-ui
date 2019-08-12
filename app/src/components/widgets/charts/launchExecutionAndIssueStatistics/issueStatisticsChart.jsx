/*
 * Copyright 2017 EPAM Systems
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
import { defectLinkSelector } from 'controllers/testItem';
import { defectTypesSelector, orderedDefectFieldsSelector } from 'controllers/project';
import { launchFiltersSelector } from 'controllers/filter';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE, PROJECT_LAUNCHES_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';
import { TooltipWrapper } from '../common/tooltip';
import { C3Chart } from '../common/c3chart';
import chartStyles from './launchExecutionAndIssueStatistics.scss';
import { Legend } from '../common/legend';
import { getDefectTypeLocators, getItemNameConfig } from '../common/utils';
import { LaunchExecutionAndIssueStatisticsTooltip } from './launchExecutionAndIssueStatisticsTooltip';
import { getPercentage, getChartData } from './chartUtils';

const chartCx = classNames.bind(chartStyles);
const getResult = (widget) => widget.content.result[0] || widget.content.result;

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    orderedContentFields: orderedDefectFieldsSelector(state),
    getDefectLink: defectLinkSelector(state),
    launchFilters: launchFiltersSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class IssueStatisticsChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    defectTypes: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    getDefectLink: PropTypes.func.isRequired,
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
    isPreview: false,
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

    !isPreview && observer.subscribe && observer.subscribe('widgetResized', this.resizeIssuesChart);

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
      this.issuesNode && this.issuesNode.removeEventListener('mousemove', this.setCoords);

      observer.unsubscribe && observer.unsubscribe('widgetResized', this.resizeIssuesChart);
    }
    this.chart = null;
  }

  onIssuesChartCreated = (chart, element) => {
    this.chart = chart;
    this.issuesNode = element;

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
      .text('ISSUES');

    this.issuesNode.addEventListener('mousemove', this.setCoords);
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
    const { widget, launchFilters, getDefectLink, defectTypes } = this.props;

    const nameConfig = getItemNameConfig(d.id);
    const id = getResult(widget).id;
    let navigationParams;

    if (!id) {
      const appliedWidgetFilterId = widget.appliedFilters[0].id;
      const activeFilter = launchFilters.filter((filter) => filter.id === appliedWidgetFilterId)[0];
      const activeFilterId = activeFilter && activeFilter.id;
      navigationParams = this.getDefaultParamsOverallStatisticsWidget(activeFilterId);
    } else {
      const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);
      const link = getDefectLink({ defects: defectLocators, itemId: id });
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

  getChartColors(columns) {
    const { defectTypes } = this.props;

    return columns.reduce((colors, column) => {
      const locator = getItemNameConfig(column[0]).locator;
      const defectTypesValues = Object.values(defectTypes);

      for (let i = 0; i < defectTypesValues.length; i += 1) {
        const defect = defectTypesValues[i].find((defectType) => defectType.locator === locator);

        if (defect) {
          Object.assign(colors, { [column[0]]: defect.color });

          return colors;
        }
      }

      return colors;
    }, {});
  }

  setDefectItems(columns) {
    this.defectItems = columns.map((item) => ({
      id: item[0],
      count: item[1],
      name: item[0]
        .split('$')
        .slice(0, 3)
        .join('$'),
    }));
  }

  getColumns() {
    const { widget, orderedContentFields } = this.props;
    const DEFECTS = '$defects$';
    const values = getResult(widget).values;
    const defectDataItems = getChartData(values, DEFECTS);
    const defectTypesChartData = defectDataItems.itemTypes;
    const columns = [];

    const orderedData = orderedContentFields.map((type) => ({
      key: type,
      value: defectTypesChartData[type] || 0,
    }));

    orderedData.forEach((item) => {
      widget.contentParameters.contentFields.forEach((field) => {
        if (field === item.key) {
          columns.push([field, item.value]);
        }
      });
    });

    return columns;
  }

  getConfig = () => {
    const { container, isPreview, onStatusPageMode, launchNameBlockHeight } = this.props;
    this.height = container.offsetHeight - launchNameBlockHeight;
    this.width = container.offsetWidth;
    this.noAvailableData = false;

    const columns = this.getColumns();

    if (!columns.length) {
      this.noAvailableData = true;
      return;
    }

    this.setDefectItems(columns);

    const colors = this.getChartColors(columns);

    this.issueConfig = {
      data: {
        columns,
        type: 'donut',
        order: null,
        colors,
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 85,
      },
      legend: {
        show: false, // we use custom legend
      },
      donut: {
        title: 0,
        label: {
          show: !isPreview,
        },
      },
      tooltip: {
        grouped: false,
        position: this.getIssuesPosition,
        contents: this.renderIssuesContents,
      },
      onrendered: this.renderTotalLabel,
    };

    if (!onStatusPageMode) {
      this.issueConfig.data.onclick = this.onChartClick;
    }

    this.setState({
      isConfigReady: true,
    });
  };

  setCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  getIssuesPosition = (d, width, height) => {
    const rect = this.issuesNode.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  defectItems = [];

  resizeIssuesChart = () => {
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
      this.issuesNode.querySelector('.c3-chart-arcs-title').childNodes[0].textContent = total;
    }
  };

  // This function is a reimplementation of its d3 counterpart, and it needs 4 arguments of which 2 are not used here.
  // These two are named a and b in the original implementation.
  renderIssuesContents = (data, a, b, color) => {
    const launchData = this.defectItems.find((item) => item.id === data[0].id);
    const itemName = Object.values(this.props.defectTypes)
      .reduce((result, defectTypes) => [...result, ...defectTypes], [])
      .find((defectType) => defectType.locator === launchData.id.split('$')[3]).longName;

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <LaunchExecutionAndIssueStatisticsTooltip
          launchNumber={data[0].value}
          duration={getPercentage(data[0].ratio)}
          color={color(data[0].name)}
          itemName={itemName}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    const { isPreview, uncheckedLegendItems, onStatusPageMode } = this.props;
    const classes = chartCx('container', { 'preview-view': isPreview });
    const chartClasses = chartCx('c3', { 'small-view': this.height <= 250 });
    const { isConfigReady } = this.state;
    const legendItems = this.defectItems.map((item) => item.id);

    return (
      <div className={classes}>
        {isConfigReady && (
          <div
            className={chartCx('issue-statistics-chart', {
              'status-page-mode': onStatusPageMode,
            })}
          >
            <div className={chartCx('data-js-issue-statistics-chart-container')}>
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
                config={this.issueConfig}
                onChartCreated={this.onIssuesChartCreated}
                className={chartClasses}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
