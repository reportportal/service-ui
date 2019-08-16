import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import * as d3 from 'd3-selection';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { STATS_PASSED } from 'common/constants/statistics';
import { C3Chart } from 'components/widgets/common/c3chart';
import { Legend } from 'components/widgets/common/legend';
import { getConfig, NOT_PASSED_STATISTICS_KEY } from './config/getConfig';
import styles from './passingRateChart.scss';

const cx = classNames.bind(styles);

@injectIntl
export class PassingRateChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
    filterNameTitle: PropTypes.object,
    filterName: PropTypes.string,
  };

  static defaultProps = {
    isPreview: false,
    observer: {},
    filterNameTitle: {},
    filterName: '',
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

    if (this.props.isPreview) {
      return;
    }

    this.node.addEventListener('mousemove', this.setupCoords);
    this.resizeHelper();
  };

  onMouseOut = () => {
    this.chart.revert();
  };

  onMouseOver = (id) => {
    this.chart.focus(id);
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

  getCustomBlock = () => {
    const {
      intl: { formatMessage },
      filterNameTitle,
      filterName,
    } = this.props;

    return (
      <div className={cx('filter-info-block')}>
        <span className={cx('filter-name-title')}>{formatMessage(filterNameTitle)}</span>
        <span className={cx('filter-name')}>{filterName}</span>
      </div>
    );
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
      content: widget.content.result,
      viewMode: widget.contentParameters.widgetOptions.viewMode,
      isPreview,
      formatMessage,
      positionCallback: this.getPosition,
      size: {
        height: this.height,
      },
      onRendered: this.resizeHelper,
    };

    this.config = getConfig(params);

    this.setState({
      isConfigReady: true,
    });
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
    this.resizeHelper();
  };

  resizeHelper = () => {
    if (!this.node || this.props.isPreview) {
      return;
    }
    const nodeElement = this.node;

    // eslint-disable-next-line func-names
    d3.selectAll(nodeElement.querySelectorAll('.bar .c3-chart-texts .c3-text')).each(function(d) {
      const selector = `c3-target-${d.id}`;
      const barBox = d3
        .selectAll(nodeElement.getElementsByClassName(selector))
        .node()
        .getBBox();
      const textElement = d3.select(this).node();
      const textBox = textElement.getBBox();
      let x = barBox.x + barBox.width / 2 - textBox.width / 2;
      if (d.id === STATS_PASSED && x < 5) x = 5;
      if (d.id === NOT_PASSED_STATISTICS_KEY && x + textBox.width > barBox.x + barBox.width)
        x = barBox.x + barBox.width - textBox.width - 5;
      textElement.setAttribute('x', `${x}`);
    });
  };

  render() {
    const viewMode = this.props.widget.contentParameters.widgetOptions.viewMode;

    return (
      this.state.isConfigReady && (
        <C3Chart
          config={this.config}
          onChartCreated={this.onChartCreated}
          className={`${cx('passing-rate-chart')} ${viewMode}`}
        >
          {!this.props.isPreview && (
            <Legend
              items={[STATS_PASSED, NOT_PASSED_STATISTICS_KEY]}
              disabled
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              customBlock={this.getCustomBlock()}
            />
          )}
        </C3Chart>
      )
    );
  }
}
