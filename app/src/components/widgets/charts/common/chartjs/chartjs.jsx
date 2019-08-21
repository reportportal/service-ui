import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@injectIntl
export class ChartJS extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    chartData: PropTypes.object.isRequired,
    chartOptions: PropTypes.object.isRequired,
    config: PropTypes.object,
    onChartElementClick: PropTypes.func,
    height: PropTypes.number.isRequired,
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
    const { chartData, chartOptions } = this.props;
    const config = {
      type: 'bar',
      data: chartData,
      options: chartOptions,
      plugins: [ChartDataLabels],
    };

    if (this.chart) {
      this.chart.data = chartData;
      this.chart.options = chartOptions;
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
    const { height } = this.props;
    return (
      <div>
        <canvas
          height={height}
          ref={(node) => {
            this.canvas = node;
          }}
        />
      </div>
    );
  }
}
