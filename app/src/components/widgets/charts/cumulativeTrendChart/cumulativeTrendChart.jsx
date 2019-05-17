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
    separate: false,
    percentage: false,
    activeAttribute: null,
  };

  componentDidMount = () => {
    this.getConfig();
  };

  onChangeFocusType = (value) => {
    this.setState({
      isConfigReady: false,
      defectTypes: value,
    });

    this.getConfig({ defectTypes: value });
  };

  onChangeTotals = () => {
    // TODO
  };

  onChangeSeparate = (value) => {
    this.setState({
      isConfigReady: false,
      separate: value,
    });

    this.getConfig({ separate: value });
  };

  onChangePercentage = (value) => {
    this.setState({
      isConfigReady: false,
      percentage: value,
    });

    this.getConfig({ percentage: value });
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

  getConfig = (options = {}) => {
    const { labels, datasets, chartOptions } = getChartData(this.props.widget, {
      ...this.state,
      options,
    });

    this.setState({
      chartData: {
        labels,
        datasets,
      },
      chartOptions,
    });
  };

  getAttributes = () => this.props.widget.contentParameters.widgetOptions.attributes;

  clearAttributes = () => {
    this.setState({
      activeAttribute: null,
    });

    this.props.clearQueryParams();
  };

  render() {
    const { isPreview } = this.props;
    const classes = cx('cumulative-trend-chart', {
      'preview-view': isPreview,
    });

    return this.state && this.state.chartData ? (
      <div className={classes}>
        <ChartJS
          chartData={this.state.chartData}
          chartOptions={this.state.chartOptions}
          onChartElementClick={this.onChartElementClick}
        >
          <CumulativeChartLegend
            items={this.state.chartData.datasets
              .map((item) => item.label)
              .filter((field) => /executions/.test(field))}
            attributes={this.getAttributes()}
            activeAttribute={this.state.activeAttribute}
            clearAttributes={this.clearAttributes}
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
