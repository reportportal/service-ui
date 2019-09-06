import React from 'react';
import PropTypes from 'prop-types';
import c3 from 'c3';

export class C3Chart extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    config: PropTypes.object,
    onChartCreated: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    children: null,
    config: {},
    onChartCreated: () => {},
    className: '',
    style: {},
  };

  componentDidMount() {
    this.updateChart(this.props.config);
  }

  componentDidUpdate() {
    this.updateChart(this.props.config);
  }

  componentWillUnmount() {
    this.destroyChart();
  }

  generateChart = (mountNode, config) => {
    const newConfig = Object.assign({ bindto: mountNode }, config);
    return c3.generate(newConfig);
  };

  loadNewData(data) {
    this.chart.load(data);
  }

  destroyChart() {
    if (this.chart) {
      this.chart = this.chart.destroy();
    }
  }

  updateChart(config) {
    this.chart = this.generateChart(this.node, config);
    this.props.onChartCreated(this.chart, this.node);
    this.loadNewData(config.data);
  }

  render() {
    return (
      <React.Fragment>
        <div
          ref={(node) => {
            this.node = node;
          }}
          className={this.props.className}
          style={this.props.style}
        />
        {this.props.children}
      </React.Fragment>
    );
  }
}
