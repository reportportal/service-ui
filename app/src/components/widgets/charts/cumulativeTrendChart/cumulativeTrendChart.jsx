import classNames from 'classnames/bind';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import isEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { getChartData } from './chartjsConfig';
import { CumulativeChartLegend } from './cumulativeChartLegend';
import { CumulativeDetails } from './cumulativeDetails';
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
    detailsView: false,
    activeAttributes: [],
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
    /* eslint no-underscore-dangle: ["error", { "allow": ["_model"] }] */
    const attributeLevel1 = element._model.label;
    const activeAttribute = {
      key: this.getAttributes()[this.state.activeAttributes.length],
      value: attributeLevel1,
    };
    const newAttributes = [...this.state.activeAttributes, activeAttribute];
    this.setState(
      {
        activeAttribute,
        activeAttributes: newAttributes,
      },
      () => {
        this.props.fetchWidget({
          attributes: this.state.activeAttributes,
        });
      },
    );
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
      activeAttributes: [],
    });

    this.props.clearQueryParams();
  };

  closeDetails = () => {
    const { activeAttributes } = this.state;
    const newAttributes = activeAttributes.slice(0, -1);

    this.props
      .fetchWidget({
        attributes: newAttributes,
      })
      .then(() => {
        this.setState({
          activeAttribute:
            activeAttributes.length > 1 ? activeAttributes[activeAttributes.length - 2] : null,
          activeAttributes: newAttributes,
        });
      });
  };

  render() {
    const { isPreview, uncheckedLegendItems, userSettings, container, widget } = this.props;
    const { legendItems, chartData, activeAttribute, activeAttributes } = this.state;
    const classes = cx('cumulative-trend-chart', { 'preview-view': isPreview });
    const legendHeight = isPreview ? 0 : 30;
    const chartHeight = container.offsetHeight - legendHeight;
    const detailsView = activeAttributes.length > 1;

    return this.state && this.state.chartData ? (
      <div className={classes}>
        {detailsView ? (
          <CumulativeDetails
            widget={widget}
            activeAttribute={activeAttribute}
            activeAttributes={activeAttributes}
            onClose={this.closeDetails}
          />
        ) : (
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
                activeAttributes={this.state.activeAttributes}
                clearAttributes={this.clearAttributes}
                onClick={this.onLegendClick}
                onChangeUserSettings={this.userSettingsChangeHandler}
                uncheckedLegendItems={uncheckedLegendItems}
                userSettings={userSettings}
              />
            )}
          </ChartJS>
        )}
      </div>
    ) : null;
  }
}
