import React from 'react';
import PropTypes from 'prop-types';
import c3 from 'c3';

export class C3Chart extends React.Component {
  static propTypes = {
    config: PropTypes.object,
    onChartCreated: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    config: {},
    onChartCreated: () => {},
    className: '',
    style: {},
  };

  componentDidMount() {
    this.updateChart(this.props.config);
  }

  componentWillReceiveProps(newProps) {
    this.updateChart(newProps.config);
  }

  componentWillUnmount() {
    this.destroyChart();
  }

  destroyChart() {
    try {
      this.chart = this.chart.destroy();
    } catch (err) {
      throw new Error('Internal C3 error', err);
    }
  }

  generateChart = (mountNode, config) => {
    const newConfig = Object.assign({ bindto: mountNode }, config);
    return c3.generate(newConfig);
  };

  loadNewData(data) {
    this.chart.load(data);
  }

  unloadData() {
    this.chart.unload();
  }

  updateChart(config) {
    if (!this.chart) {
      this.chart = this.generateChart(this.node, config);
      this.props.onChartCreated(this.chart, this.node);
    }

    if (config.unloadBeforeLoad) {
      this.unloadData();
    }

    this.loadNewData(config.data);
  }

  render() {
    const className = this.props.className ? ` ${this.props.className}` : '';
    const style = this.props.style ? this.props.style : {};
    return (
      <div
        ref={(node) => {
          this.node = node;
        }}
        className={className}
        style={style}
      />
    );
  }
}
