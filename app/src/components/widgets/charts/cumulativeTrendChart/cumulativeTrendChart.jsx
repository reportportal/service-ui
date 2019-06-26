import { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import classNames from 'classnames/bind';
import styles from './cumulativeTrendChart.scss';
import { getChartData } from './chartjsConfig';
import { CumulativeChartLegend } from './cumulativeChartLegend';

const cx = classNames.bind(styles);

@injectIntl
export class CumulativeTrendChart extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
    fetchWidget: PropTypes.func,
    clearQueryParams: PropTypes.func,
    queryParameters: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    observer: null,
    defectTypes: false,
    fetchWidget: () => {},
    clearQueryParams: () => {},
    queryParameters: {},
  };

  constructor(args) {
    super(args);
    const { queryParameters } = this.props;
    if (queryParameters && queryParameters.attributes) {
      this.state.activeAttribute = queryParameters.attributes[0];
    }
  }

  state = {
    defectTypes: false,
    showTotal: false,
    separate: false,
    percentage: false,
    activeAttribute: null,
    disabledFields: [],
    legendItems: [],
    chartType: 'bar',
  };

  componentDidMount = () => {
    this.getConfig();
  };

  onChangeFocusType = (value) => {
    this.setState(
      {
        isConfigReady: false,
        defectTypes: value,
      },
      this.getConfig,
    );
  };

  onChangeTotals = (value) => {
    this.setState(
      {
        isConfigReady: false,
        showTotal: value,
      },
      this.getConfig,
    );
  };

  onChangeSeparate = (value) => {
    this.setState(
      {
        isConfigReady: false,
        separate: value,
      },
      this.getConfig,
    );
  };

  onChangePercentage = (value) => {
    this.setState(
      {
        isConfigReady: false,
        percentage: value,
      },
      this.getConfig,
    );
  };

  onChartElementClick = (element) => {
    if (this.state.activeAttribute) {
      return;
    }
    /* eslint no-underscore-dangle: ["error", { "allow": ["_model"] }] */
    const attributeLevel1 = element._model.label;
    const activeAttribute = {
      key: this.getAttributes()[0],
      value: attributeLevel1,
    };

    this.setState({
      activeAttribute,
    });

    this.props.fetchWidget({
      attributes: [activeAttribute],
    });
  };

  onLegendClick = (fieldName) => {
    this.toggleField(fieldName, this.getConfig);
  };

  getConfig = (options = {}) => {
    const { labels, datasets, chartOptions, legendItems } = getChartData(this.props.widget, {
      ...this.state,
      options,
      formatMessage: this.props.intl.formatMessage,
      activeAttribute: this.state.activeAttribute,
    });

    this.setState({
      chartData: {
        labels,
        datasets,
      },
      chartOptions,
      legendItems,
    });
  };

  getAttributes = () => this.props.widget.contentParameters.widgetOptions.attributes;

  toggleField = (fieldName, callback) => {
    const { disabledFields } = this.state;

    this.setState(
      {
        disabledFields: disabledFields.includes(fieldName)
          ? disabledFields.filter((field) => field !== fieldName)
          : disabledFields.concat([fieldName]),
      },
      callback,
    );
  };

  clearAttributes = () => {
    this.setState({
      activeAttribute: null,
    });

    this.props.clearQueryParams();
  };

  render() {
    const { isPreview } = this.props;
    const { legendItems, chartData, chartType } = this.state;
    const classes = cx('cumulative-trend-chart', { 'preview-view': isPreview });

    return chartType && chartData ? (
      <div className={classes}>
        <ChartJS
          type={chartType}
          chartData={chartData}
          chartOptions={this.state.chartOptions}
          onChartElementClick={this.onChartElementClick}
        >
          <CumulativeChartLegend
            items={legendItems}
            attributes={this.getAttributes()}
            activeAttribute={this.state.activeAttribute}
            clearAttributes={this.clearAttributes}
            onClick={this.onLegendClick}
            onChangeFocusType={this.onChangeFocusType}
            onChangeTotals={this.onChangeTotals}
            onChangeSeparate={this.onChangeSeparate}
            onChangePercentage={this.onChangePercentage}
          />
        </ChartJS>
      </div>
    ) : null;
  }
}
