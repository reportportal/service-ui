import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@injectIntl
export class ChartJS extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    type: PropTypes.string.isRequired,
    chartData: PropTypes.object.isRequired,
    chartOptions: PropTypes.object.isRequired,
    config: PropTypes.object,
    onChartCreated: PropTypes.func,
    onChartElementClick: PropTypes.func,
    children: PropTypes.node,
  };

  static defaultProps = {
    data: {},
    config: {},
    onChartCreated: () => {},
    onChartElementClick: null,
    children: null,
  };

  componentDidMount() {
    this.createChart();
  }

  componentDidUpdate() {
    this.createChart();
  }

  componentWillUnmount() {
    this.chart && this.chart.destroy();
    this.chart = null;
  }

  createChart() {
    const { chartData, chartOptions, type } = this.props;
    const config = {
      type,
      data: chartData,
      options: chartOptions,
      plugins: [ChartDataLabels],
    };

    if (this.chart) {
      this.chart.data = chartData;
      this.chart.options = chartOptions;
      this.chart.type = type;
      this.chart.update(config);
    } else {
      this.chart = this.generateChart(config);
      this.props.onChartCreated(this.chart, this.canvas);
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
      if (chartElement.length) {
        this.props.onChartElementClick(
          chartElement[0],
          /* eslint no-underscore-dangle: ["error", { "allow": ["_datasetIndex"] }] */
          config.data.datasets[chartElement[0]._datasetIndex],
        );
      }
    };

    return chartObj;
  };

  render() {
    return (
      <Fragment>
        <canvas
          height="180"
          width="600"
          ref={(node) => {
            this.canvas = node;
          }}
        />
        {this.props.children}
      </Fragment>
    );
  }
}
