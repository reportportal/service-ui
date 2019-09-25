import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { C3Chart } from '../../../common/c3chart';
import { Legend } from '../../../common/legend';
import { getConfig } from './config/getConfig';
import styles from './nonPassedTestCasesTrendChart.scss';

const cx = classNames.bind(styles);

const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';

@injectIntl
export class NonPassedTestCasesTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
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
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
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
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.resizeChart();

    this.node.addEventListener('mousemove', this.setupCoords);
  };

  getConfig = () => {
    const {
      intl: { formatMessage },
      widget,
      isPreview,
      container,
    } = this.props;

    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    const params = {
      content: widget.content,
      isPreview,
      formatMessage,
      positionCallback: this.getPosition,
      size: {
        height: container.offsetHeight,
      },
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
    const { isPreview } = this.props;
    const classes = cx('non-passed-cases-trend-chart', {
      'preview-view': isPreview,
    });
    return (
      <div className={classes}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!isPreview && <Legend items={[FAILED_SKIPPED_STATISTICS_KEY]} disabled />}
          </C3Chart>
        )}
      </div>
    );
  }
}
