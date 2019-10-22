import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import c3 from 'c3';

export class C3Chart extends Component {
  static propTypes = {
    children: PropTypes.node,
    config: PropTypes.object,
    configCreationTimeStamp: PropTypes.number,
    onChartCreated: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
  };

  static defaultProps = {
    children: null,
    config: {},
    configCreationTimeStamp: null,
    onChartCreated: () => {},
    className: '',
    style: {},
  };

  componentDidMount() {
    this.createChart(this.props.config);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.configCreationTimeStamp !== this.props.configCreationTimeStamp) {
      this.createChart(this.props.config);
    }
  }

  componentWillUnmount() {
    this.destroyChart();
  }

  generateChart = (mountNode, config) => {
    const newConfig = Object.assign({ bindto: mountNode }, config);
    return c3.generate(newConfig);
  };

  destroyChart() {
    if (this.chart) {
      this.chart = this.chart.destroy();
    }
  }

  createChart(config) {
    this.chart = this.generateChart(this.node, config);
    this.props.onChartCreated(this.chart, this.node);
  }

  render() {
    return (
      <Fragment>
        <div
          ref={(node) => {
            this.node = node;
          }}
          className={this.props.className}
          style={this.props.style}
        />
        {this.props.children}
      </Fragment>
    );
  }
}
