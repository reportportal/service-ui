import { PureComponent, Fragment } from 'react';
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
    const { chartData, chartOptions } = this.props;
    this.createChart({
      type: 'bar',
      data: chartData,
      options: chartOptions,
      plugins: [ChartDataLabels],
    });
  }

  createChart(config) {
    this.chart = this.generateChart(config);
    this.props.onChartCreated(this.chart, this.node);

    if (config.unloadBeforeLoad) {
      this.unloadData();
    }
  }

  generateChart = (config) => {
    if (!this.canvas) {
      return false;
    }

    const ctx = this.canvas.getContext('2d');
    const chartObj = new Chart(ctx, config);

    this.canvas.onclick = (event) => {
      if (typeof this.props.onChartElementClick !== 'function') {
        return;
      }

      const chartElement = chartObj.getElementAtEvent(event);
      if (chartElement.length) {
        this.props.onChartElementClick(chartElement[0]);
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
