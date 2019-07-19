import { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import classNames from 'classnames/bind';
import { getChartData } from './chartjsConfig';
import { CumulativeChartLegend } from './cumulativeChartLegend';
import styles from './cumulativeTrendChart.scss';

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
    onChangeLegend: PropTypes.func,
    uncheckedLegendItems: PropTypes.array,
    userSettings: PropTypes.object,
    onChangeUserSettings: PropTypes.func,
    container: PropTypes.instanceOf(Element).isRequired,
  };

  static defaultProps = {
    isPreview: false,
    observer: null,
    fetchWidget: () => {},
    clearQueryParams: () => {},
    queryParameters: {},
    onChangeLegend: () => {},
    uncheckedLegendItems: [],
    userSettings: {},
    onChangeUserSettings: () => {},
  };

  constructor(args) {
    super(args);

    const { queryParameters } = this.props;
    if (queryParameters && queryParameters.attributes) {
      this.state.activeAttribute = queryParameters.attributes[0];
    }
  }

  state = {
    legendItems: [],
  };

  componentDidMount = () => {
    this.getConfig();
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget.content, this.props.widget.content)) {
      this.getConfig();
    }
  }

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
    this.props.onChangeLegend(fieldName, this.getConfig);
  };

  getConfig = (options = {}) => {
    const { uncheckedLegendItems, widget, userSettings } = this.props;

    const { labels, datasets, chartOptions, legendItems } = getChartData(widget, {
      ...userSettings,
      options,
      uncheckedLegendItems,
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

  userSettingsChangeHandler = (data) => this.props.onChangeUserSettings(data, this.getConfig);

  clearAttributes = () => {
    this.setState({
      activeAttribute: null,
    });

    this.props.clearQueryParams();
  };

  render() {
    const { isPreview, uncheckedLegendItems, userSettings, container } = this.props;
    const { legendItems, chartData } = this.state;
    const classes = cx('cumulative-trend-chart', { 'preview-view': isPreview });
    const legendHeight = isPreview ? 0 : 30;
    const chartHeight = container.offsetHeight - legendHeight;

    return this.state && this.state.chartData ? (
      <div className={classes}>
        <ChartJS
          chartData={chartData}
          chartOptions={this.state.chartOptions}
          onChartElementClick={this.onChartElementClick}
          height={chartHeight}
        >
          {!isPreview && (
            <CumulativeChartLegend
              items={legendItems}
              attributes={this.getAttributes()}
              activeAttribute={this.state.activeAttribute}
              clearAttributes={this.clearAttributes}
              onClick={this.onLegendClick}
              onChangeUserSettings={this.userSettingsChangeHandler}
              uncheckedLegendItems={uncheckedLegendItems}
              userSettings={userSettings}
            />
          )}
        </ChartJS>
      </div>
    ) : null;
  }
}
