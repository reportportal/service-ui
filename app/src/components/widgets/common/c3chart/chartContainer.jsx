import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { Legend } from '../legend';
import { C3Chart } from './c3chart';

export class ChartContainer extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    configData: PropTypes.object,
    legendConfig: PropTypes.shape({
      showLegend: PropTypes.bool,
      onChangeLegend: PropTypes.func,
      uncheckedLegendItems: PropTypes.array,
      legendProps: PropTypes.object,
    }),
    chartCreatedCallback: PropTypes.func,
    className: PropTypes.string,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {
      subscribe: () => {},
      unsubscribe: () => {},
    },
    configData: {},
    chartCreatedCallback: () => {},
    legendConfig: {
      showLegend: false,
      onChangeLegend: () => {},
      uncheckedLegendItems: [],
      legendProps: {},
    },
    className: '',
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
    if (!this.props.isPreview) {
      this.node.removeEventListener('mousemove', this.setupCoords);
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    }
    this.chart = null;
  }

  onChartCreated = (chart, element) => {
    const { widget, isPreview, legendConfig, chartCreatedCallback } = this.props;
    const { showLegend, legendProps, uncheckedLegendItems = [] } = legendConfig;
    this.chart = chart;
    this.node = element;

    if (!widget.content.result || isPreview) {
      return;
    }

    if (showLegend && !legendProps.disabled) {
      this.chart.toggle(uncheckedLegendItems);
    }

    this.resizeChart();
    this.node.addEventListener('mousemove', this.setupCoords);
    chartCreatedCallback(element);
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

  setupConfig = () => {
    const { widget, isPreview, container, configData } = this.props;
    const { getConfig, ...configParams } = configData;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    const params = {
      content: widget.content.result,
      isPreview,
      positionCallback: this.getPosition,
      size: {
        height: this.height,
      },
      ...configParams,
    };

    this.config = getConfig(params);

    this.setState({
      isConfigReady: true,
    });
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    const left = this.x - rect.left - width / 2;
    const top = this.y - rect.top - height;

    return {
      top: top - 8,
      left,
    };
  };

  setupCoords = ({ pageX, pageY }) => {
    this.x = pageX;
    this.y = pageY;
  };

  resizeChart = () => {
    const newHeight = this.props.container.offsetHeight;
    const newWidth = this.props.container.offsetWidth;

    if (this.height !== newHeight) {
      this.chart.resize({
        height: newHeight,
      });
      this.height = newHeight;
      this.config.size.height = newHeight;
    } else if (this.width !== newWidth) {
      this.chart.flush();
    }
    this.width = newWidth;
  };

  render() {
    const { isPreview, legendConfig, className } = this.props;
    const { showLegend, legendProps } = legendConfig;

    return (
      this.state.isConfigReady && (
        <C3Chart className={className} config={this.config} onChartCreated={this.onChartCreated}>
          {!isPreview &&
            showLegend && (
              <Legend
                items={this.config.legendItems}
                colors={this.config.data.colors}
                {...legendProps}
                onClick={this.onClickLegendItem}
                onMouseOver={this.onLegendMouseOver}
                onMouseOut={this.onLegendMouseOut}
              />
            )}
        </C3Chart>
      )
    );
  }
}
