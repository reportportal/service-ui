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

import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export class ChartJS extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    chartData: PropTypes.object.isRequired,
    chartOptions: PropTypes.object.isRequired,
    config: PropTypes.object,
    onChartElementClick: PropTypes.func,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  static defaultProps = {
    data: {},
    config: {},
    onChartElementClick: null,
  };

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  componentWillUnmount() {
    this.chart.destroy();
    this.chart = null;
  }

  createChart() {
    const { chartData, chartOptions, height, width } = this.props;
    const config = {
      type: 'bar',
      data: chartData,
      options: chartOptions,
      plugins: [ChartDataLabels],
    };

    if (this.chart) {
      this.chart.data = chartData;
      this.chart.options = chartOptions;
      this.chart.height = height;
      this.chart.width = width;
      this.chart.canvas.style.height = `${height}px`;
      this.chart.update(config);
    } else {
      this.chart = this.generateChart(config);
    }
  }

  generateChart = (config) => {
    const { canvas } = this;
    if (!canvas) {
      return false;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const chartObj = new Chart(ctx, config);

    this.canvas.onclick = (event) => {
      if (typeof this.props.onChartElementClick !== 'function') {
        return;
      }

      const chartElement = chartObj.getElementAtEvent(event);
      this.props.onChartElementClick(chartElement[0], event);
    };

    return chartObj;
  };

  render() {
    const { height, width } = this.props;
    return (
      <div>
        <canvas
          height={height}
          width={width}
          ref={(node) => {
            this.canvas = node;
          }}
        />
      </div>
    );
  }
}
