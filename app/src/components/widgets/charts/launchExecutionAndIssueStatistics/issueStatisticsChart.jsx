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
import { redirect } from 'redux-first-router';
import ReactDOMServer from 'react-dom/server';
import { defectLinkSelector } from 'controllers/testItem';
import { defectTypesSelector } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { TooltipWrapper } from '../common/tooltip';
import { C3Chart } from '../common/c3chart';
import chartStyles from './launchExecutionAndIssueStatistics.scss';
import { Legend } from './launchExecutionAndIssuesChartLegend';
import { getDefectTypeLocators, getItemNameConfig } from '../common/utils';
import { LaunchExecutionAndIssueStatisticsTooltip } from './launchExecutionAndIssueStatisticsTooltip';
import { getPercentage, getDefectItems, getChartData } from './chartUtils';
import { messages } from './messages';

const chartCx = classNames.bind(chartStyles);

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    getDefectLink: (params) => defectLinkSelector(state, params),
  }),
  {
    redirect,
  },
)
export class IssueStatisticsChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    redirect: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
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
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeIssuesChart);
    this.getConfig();
  }
  componentWillUnmount() {
    if (!this.props.isPreview) {
      this.issuesNode.removeEventListener('mousemove', this.setCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeIssuesChart);
    }
  }

  onIssuesChartCreated = (chart, element) => {
    this.issuesChart = chart;
    this.issuesNode = element;
    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    d3
      .select(chart.element)
      .select('.c3-chart-arcs-title')
      .attr('dy', -15)
      .append('tspan')
      .attr('dy', 30)
      .attr('x', 0)
      .attr('fill', '#666')
      .text('ISSUES');

    this.issuesNode.addEventListener('mousemove', this.setCoords);
  };

  onIssuesMouseOut = () => {
    this.issuesChart.revert();
  };

  onIssuesMouseOver = (id) => {
    this.issuesChart.focus(id);
  };

  onIssuesClick = (id) => {
    this.issuesChart.toggle(id);
  };

  onChartClick = (d) => {
    const { widget, getDefectLink, defectTypes } = this.props;

    const nameConfig = getItemNameConfig(d.id);
    const id = widget.content.result[0].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = getDefectLink({ defects: defectLocators, itemId: id });

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

  getConfig = () => {
    const DEFECTS = '$defects$';
    const { widget, container } = this.props;
    const values = widget.content.result[0].values;
    const defectDataItems = getChartData(values, DEFECTS);

    const defectTypesChartData = defectDataItems.itemTypes;
    const defectTypesChartColors = defectDataItems.itemColors;
    const defectTypesChartDataOrdered = [];

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;
    this.noAvailableData = false;

    widget.contentParameters.contentFields.forEach((field) => {
      Object.keys(defectTypesChartData).forEach((key) => {
        if (field === key) {
          defectTypesChartDataOrdered.push([field, defectTypesChartData[field]]);
        }
      });
    });

    if (!defectTypesChartDataOrdered.length) {
      this.noAvailableData = true;
      return;
    }

    this.defectItems = getDefectItems(defectTypesChartDataOrdered);
    this.issueConfig = {
      data: {
        columns: defectTypesChartDataOrdered,
        type: 'donut',
        order: null,
        colors: defectTypesChartColors,
        onclick: this.onChartClick,
      },
      interaction: {
        enabled: !self.isPreview,
      },
      padding: {
        top: self.isPreview ? 0 : 85,
      },
      legend: {
        show: false, // we use custom legend
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
        position: this.getIssuesPosition,
        contents: this.renderIssuesContents,
      },
      onrendered: () => {
        if (this.issuesChart) {
          const total = this.issuesChart.data
            .shown()
            .reduce((acc, dataItem) => acc + dataItem.values[0].value, 0);
          this.issuesNode.querySelector('.c3-chart-arcs-title').childNodes[0].textContent = total;
        }
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

  getIssuesPosition = (d, width, height) => {
    const rect = this.issuesNode.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  resizeIssuesChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;
    if (this.height !== newHeight) {
      this.issuesChart.resize({
        height: newHeight,
      });
      this.height = newHeight;
    } else if (this.width !== newWidth) {
      this.issuesChart.flush();
      this.width = newWidth;
    }
  };

  // This function is a reimplementation of its d3 counterpart, and it needs 4 arguments of which 2 are not used here.
  // These two are named a and b in the original implementation.
  renderIssuesContents = (data, a, b, color) => {
    const launchData = this.defectItems.find((item) => item.id === data[0].id);

    return ReactDOMServer.renderToStaticMarkup(
      <TooltipWrapper>
        <LaunchExecutionAndIssueStatisticsTooltip
          launchNumber={data[0].value}
          duration={getPercentage(data[0].ratio)}
          color={color(data[0].name)}
          itemName={this.props.intl.formatMessage(messages[launchData.name.split('$total')[0]])}
        />
      </TooltipWrapper>,
    );
  };

  render() {
    const { isPreview } = this.props;
    const classes = chartCx({ 'preview-view': isPreview });
    const { isConfigReady } = this.state;
    return (
      <div className={classes}>
        {isConfigReady && (
          <div className={chartCx('issue-statistics-chart')}>
            <div className={chartCx('data-js-issue-statistics-chart-container')}>
              {!isPreview && (
                <Legend
                  items={this.defectItems}
                  onClick={this.onIssuesClick}
                  onMouseOver={this.onIssuesMouseOver}
                  onMouseOut={this.onIssuesMouseOut}
                />
              )}
              <C3Chart
                config={this.issueConfig}
                onChartCreated={this.onIssuesChartCreated}
                className={chartCx('c3')}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
