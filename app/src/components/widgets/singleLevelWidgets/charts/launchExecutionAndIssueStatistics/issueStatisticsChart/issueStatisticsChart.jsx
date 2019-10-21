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
import { injectIntl, intlShape } from 'react-intl';
import * as d3 from 'd3-selection';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import isEqual from 'fast-deep-equal';
import ReactDOMServer from 'react-dom/server';
import {
  defectLinkSelector,
  statisticsLinkSelector,
  TEST_ITEMS_TYPE_LIST,
} from 'controllers/testItem';
import { defectTypesSelector, orderedDefectFieldsSelector } from 'controllers/project';
import { launchFiltersSelector } from 'controllers/filter';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';
import { getItemNameConfig, getDefectTypeLocators } from 'components/widgets/common/utils';
import { C3Chart } from 'components/widgets/common/c3chart';
import { Legend } from 'components/widgets/common/legend';
import { IssueTypeStatTooltip } from '../../common/issueTypeStatTooltip';
import { getPercentage, getChartData, isSmallDonutChartView } from '../chartUtils';
import styles from './issueStatisticsChart.scss';

const cx = classNames.bind(styles);
const getResult = (widget) => widget.content.result[0] || widget.content.result;

@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    orderedContentFields: orderedDefectFieldsSelector(state),
    getDefectLink: defectLinkSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
    launchFilters: launchFiltersSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
@injectIntl
export class IssueStatisticsChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    defectTypes: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    getDefectLink: PropTypes.func.isRequired,
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
      .attr('dy', onStatusPageMode || isSmallDonutChartView(this.height, this.width) ? 15 : 30)
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
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);
    let navigationParams;
    let link;

    if (!id) {
      const appliedWidgetFilterId = widget.appliedFilters[0].id;
      const launchesLimit = widget.contentParameters.itemsCount;
      const isLatest = widget.contentParameters.widgetOptions.latest;
      const activeFilter = launchFilters.filter((filter) => filter.id === appliedWidgetFilterId)[0];
      const activeFilterId = (activeFilter && activeFilter.id) || appliedWidgetFilterId;

      link = getDefectLink({
        defects: defectLocators,
        itemId: TEST_ITEMS_TYPE_LIST,
        launchesLimit,
        isLatest,
      });
      navigationParams = this.getDefaultParamsOverallStatisticsWidget(activeFilterId);
    } else {
      link = getDefectLink({ defects: defectLocators, itemId: id });
      navigationParams = this.getDefaultParamsLaunchExecutionWidget(id);
    }

    this.props.navigate(Object.assign(link, navigationParams));
  };

  getDefaultParamsOverallStatisticsWidget = (activeFilterId) => ({
    payload: {
      projectId: this.props.project,
      filterId: activeFilterId,
      testItemIds: TEST_ITEMS_TYPE_LIST,
    },
    type: TEST_ITEM_PAGE,
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
    this.configCreationTimeStamp = Date.now();

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
      this.width = newWidth;
      this.height = newHeight;
      this.forceUpdate();
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
      this.forceUpdate();
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

  renderIssuesContents = (data, a, b, color) => {
    const {
      intl: { formatMessage },
      defectTypes,
    } = this.props;
    const { value, ratio, id } = data[0];

    return ReactDOMServer.renderToStaticMarkup(
      <IssueTypeStatTooltip
        itemsCount={`${value} (${getPercentage(ratio)}%)`}
        color={color(id)}
        issueStatNameProps={{ itemName: id, defectTypes, formatMessage }}
      />,
    );
  };

  render() {
    const { isPreview, uncheckedLegendItems, onStatusPageMode } = this.props;
    const { isConfigReady } = this.state;
    const legendItems = this.defectItems.map((item) => item.id);

    return (
      <div className={cx('container', { 'preview-view': isPreview })}>
        {isConfigReady && (
          <div
            className={cx('issue-statistics-chart', {
              'status-page-mode': onStatusPageMode,
            })}
          >
            <div className={cx('data-js-issue-statistics-chart-container')}>
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
                className={cx({ 'small-view': isSmallDonutChartView(this.height, this.width) })}
                configCreationTimeStamp={this.configCreationTimeStamp}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
