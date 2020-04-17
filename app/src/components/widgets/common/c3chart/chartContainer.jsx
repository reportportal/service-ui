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
import isEqual from 'fast-deep-equal';
import { C3Chart } from './c3chart';
import { Legend } from '../legend';

export class ChartContainer extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    heightOffset: PropTypes.number,
    observer: PropTypes.object,
    configData: PropTypes.shape({
      getConfig: PropTypes.func,
    }),
    legendConfig: PropTypes.shape({
      showLegend: PropTypes.bool,
      onChangeLegend: PropTypes.func,
      uncheckedLegendItems: PropTypes.array,
      legendProps: PropTypes.object,
    }),
    chartCreatedCallback: PropTypes.func,
    className: PropTypes.string,
    isCustomTooltip: PropTypes.bool,
    resizedCallback: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    heightOffset: 0,
    observer: {
      subscribe: () => {},
      unsubscribe: () => {},
    },
    configData: {
      getConfig: () => {},
    },
    chartCreatedCallback: () => {},
    legendConfig: {
      showLegend: false,
      onChangeLegend: () => {},
      uncheckedLegendItems: [],
      legendProps: {},
    },
    className: '',
    isCustomTooltip: false,
    resizedCallback: null,
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    if (!this.props.isPreview) {
      this.props.observer.subscribe('widgetResized', this.resizeChart);
    }
    this.setupConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.setupConfig();
    }
  }

  componentWillUnmount() {
    const { isPreview, observer, isCustomTooltip } = this.props;
    if (!isPreview) {
      observer.unsubscribe('widgetResized', this.resizeChart);
      !isCustomTooltip && this.node && this.node.removeEventListener('mousemove', this.setupCoords);
    }
    this.chart = null;
  }

  onChartCreated = (chart, element) => {
    const { widget, isPreview, legendConfig, isCustomTooltip, chartCreatedCallback } = this.props;
    const { showLegend, legendProps = {}, uncheckedLegendItems = [] } = legendConfig;
    this.chart = chart;
    this.node = element;
    chartCreatedCallback(element, chart, this.config.customData);

    if (!widget.content.result || isPreview) {
      return;
    }

    if (showLegend && !legendProps.disabled) {
      this.chart.toggle(uncheckedLegendItems);
    }

    this.resizeChart();
    if (!isCustomTooltip && !this.isChartCreated) {
      this.node.addEventListener('mousemove', this.setupCoords);
      this.isChartCreated = true;
    }
  };

  onLegendMouseOut = () => {
    this.chart.revert();
  };

  onLegendMouseOver = (id) => {
    this.chart.focus(id);
  };

  onClickLegendItem = (id) => {
    this.props.legendConfig.onChangeLegend(id);
    this.chart.toggle(id);
  };

  onZoomEnd = () => {
    this.chart.flush();
  };

  setupConfig = () => {
    const { widget, isPreview, container, configData, heightOffset } = this.props;
    const { getConfig, ...configParams } = configData;

    this.height = container.offsetHeight - heightOffset;
    this.width = container.offsetWidth;

    const params = {
      content: widget.content.result,
      isPreview,
      positionCallback: this.getPosition,
      size: {
        height: this.height,
      },
      onZoomEnd: this.onZoomEnd,
      ...configParams,
    };

    this.config = getConfig(params);
    this.configCreationTimeStamp = Date.now();

    this.setState({
      isConfigReady: true,
    });
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    let left = this.x - rect.left - width / 2;
    if (left < 0) {
      left = 0;
    } else if (left + width > rect.width) {
      left = rect.width - width;
    }
    let top = this.y - rect.top - height;
    if (top < 0) {
      top = this.y - rect.top + 8;
    }

    return {
      top: top - 8,
      left,
    };
  };

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  configCreationTimeStamp = null;

  isChartCreated = false;

  resizeChart = () => {
    const { container, resizedCallback, heightOffset } = this.props;
    const newHeight = container.offsetHeight - heightOffset;
    const newWidth = container.offsetWidth;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
      });
      this.height = newHeight;
      this.width = newWidth;
      if (this.config.size) {
        this.config.size.height = newHeight;
      }
      resizedCallback && resizedCallback();
    } else if (this.width !== newWidth) {
      this.width = newWidth;
      this.chart.flush();
      resizedCallback && resizedCallback();
    }
  };

  render() {
    const { isPreview, legendConfig, className } = this.props;
    const { showLegend, legendProps = {} } = legendConfig;

    if (!this.state.isConfigReady) {
      return '';
    }

    const { customData = {}, ...config } = this.config;

    return (
      <C3Chart
        className={className}
        config={config}
        configCreationTimeStamp={this.configCreationTimeStamp}
        onChartCreated={this.onChartCreated}
      >
        {!isPreview && showLegend && (
          <Legend
            items={customData.legendItems}
            colors={config.data.colors}
            {...legendProps}
            onClick={this.onClickLegendItem}
            onMouseOver={this.onLegendMouseOver}
            onMouseOut={this.onLegendMouseOut}
          />
        )}
      </C3Chart>
    );
  }
}
