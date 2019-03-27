import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import ReactDOMServer from 'react-dom/server';
import classNames from 'classnames/bind';
import { C3Chart } from 'components/widgets/charts/common/c3chart';
import { messages as commonMessages } from '../common/messages';
import { Legend } from '../common/legend';
import styles from './cumulativeTrendChart.scss';
import { CumulativeTrendTooltip } from './tooltip';
import { generateChartDataParams, generateChartColors, getColorForKey } from './generateConfig';

const cx = classNames.bind(styles);

const messages = {
  statistics$executions$failed: commonMessages.failed,
  statistics$executions$skipped: commonMessages.skipped,
  statistics$executions$passed: commonMessages.passed,
  statistics$defects$product_bug$total: commonMessages.pb,
  statistics$defects$automation_bug$total: commonMessages.ab,
  statistics$defects$system_issue$total: commonMessages.si,
  statistics$defects$no_defect$total: commonMessages.nd,
  statistics$defects$to_investigate$total: commonMessages.ti,
};

@injectIntl
export class CumulativeTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    container: PropTypes.instanceOf(Element).isRequired,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: null,
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
  };

  state = {
    isConfigReady: false,
  };

  componentDidMount() {
    if (!this.props.isPreview) {
      this.props.observer.subscribe('widgetResized', this.resizeChart);
    }
    this.getConfig();
  }

  componentWillUnmount() {
    if (!this.props.isPreview) {
      if (this.node && this.node.removeEventListener) {
        this.node.removeEventListener('mousemove', this.getCoords);
      }
      this.props.observer.unsubscribe('widgetResized', this.resizeChart);
    }
  }

  onChartCreated = (chart, element) => {
    this.chart = chart;
    this.node = element;

    if (!this.props.widget.content.result || this.props.isPreview) {
      return;
    }

    this.props.uncheckedLegendItems.forEach((id) => {
      this.chart.toggle(id);
    });

    this.resizeChart();

    this.node.addEventListener('mousemove', this.getCoords);
  };

  onChartClick = () => {
    // TODO: to implement redux+store filtered navigation
    // (not based on URL construction as in other chart examples)
  };

  onMouseOut = () => {
    this.chart.revert();
  };

  onMouseOver = (id) => {
    this.chart.focus(id);
  };

  onClickLegendItem = (id) => {
    this.props.onChangeLegend(id);
    this.chart.toggle(id);
  };

  getConfig = () => {
    const { widget, isPreview, container } = this.props;

    if (!widget || !widget.content || !widget.content.result) {
      return;
    }

    const { chartDataColumns, dataGroupNames } = generateChartDataParams(widget);
    const colors = generateChartColors(widget);

    this.dataGroupNames = dataGroupNames;
    this.height = container.offsetHeight;
    this.width = container.offsetWidth;

    this.config = {
      data: {
        columns: chartDataColumns,
        type: 'bar',
        onclick: this.onChartClick,
        colors,
      },
      axis: {
        x: {
          show: !isPreview,
          type: 'category',
          categories: this.dataGroupNames.map((category) => {
            const prefix = widget.contentParameters.widgetOptions.prefix;
            return category.indexOf(prefix) > -1 ? category.split(`${prefix}:`)[1] : category;
          }),
          tick: {
            centered: true,
            inner: true,
          },
        },
        y: {
          show: !isPreview,
        },
      },
      grid: {
        y: {
          show: !isPreview,
        },
      },
      size: {
        height: this.height,
      },
      interaction: {
        enabled: !isPreview,
      },
      padding: {
        top: isPreview ? 0 : 85,
      },
      legend: {
        show: false, // we use custom legend
      },
      tooltip: {
        grouped: false,
        position: this.getPosition,
        contents: this.renderContents,
      },
    };

    this.setState({
      isConfigReady: true,
    });
  };

  getPosition = (d, width, height) => {
    const rect = this.node.getBoundingClientRect();
    const top = this.y - rect.top - height;
    let left = this.x - rect.left - width / 2;

    if (left < 0) {
      left = 0;
    } else if (left + width > rect.width) {
      left = rect.width - width;
    }

    return {
      top: top - 8,
      left,
    };
  };

  getCoords = ({ pageX, pageY }) => {
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
    } else if (this.width !== newWidth) {
      this.chart.flush();
      this.width = newWidth;
    }
  };

  renderContents = (d) => {
    const index = d[0].index;
    const groupName = this.dataGroupNames[index];
    const columns = this.config.data.columns;
    const itemsData = columns.map((column) => {
      const id = column[0];
      const message = messages[id];
      const value = column[index + 1] || 0;

      return {
        id,
        color: getColorForKey(id),
        name: this.props.intl.formatMessage(message),
        value,
      };
    });

    return ReactDOMServer.renderToStaticMarkup(
      <CumulativeTrendTooltip groupName={groupName} itemsData={itemsData} />,
    );
  };

  render() {
    const { isPreview, uncheckedLegendItems } = this.props;
    const classes = cx('cumulative-trend-chart', {
      'preview-view': isPreview,
    });
    return (
      <div className={classes}>
        {this.state.isConfigReady && (
          <C3Chart config={this.config} onChartCreated={this.onChartCreated}>
            {!isPreview && (
              <Legend
                items={Object.getOwnPropertyNames(this.config.data.colors)}
                uncheckedLegendItems={uncheckedLegendItems}
                onClick={this.onClickLegendItem}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
              />
            )}
          </C3Chart>
        )}
      </div>
    );
  }
}
