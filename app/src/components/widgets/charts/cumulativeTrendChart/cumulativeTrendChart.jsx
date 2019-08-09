import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { injectIntl, intlShape } from 'react-intl';
import { VirtualPopup } from 'components/main/virtualPopup';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import { ActionsPopup } from 'components/widgets/charts/common/actionsPopup';
import SearchIcon from 'common/img/search-icon-inline.svg';
import FiltersIcon from 'common/img/filters-icon-inline.svg';
import { getChartData } from './chartjsConfig';
import { CumulativeChartLegend } from './legend/cumulativeChartLegend';
import { CumulativeDetails } from './cumulativeDetails';
import styles from './cumulativeTrendChart.scss';

const cx = classNames.bind(styles);

const LEGEND_HEIGHT = 45;

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

  state = {
    legendItems: [],
    detailsView: false,
    activeAttributes: [],
    isDetailsView: false,
    activeAttribute: null,
    focusedAttributeValue: null,
  };

  componentDidMount = () => {
    this.getConfig();
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  componentWillUnmount() {
    this.node.removeEventListener('mousemove', this.setupPopupPosition);
  }

  onChartCreated = (element) => {
    this.node = element;

    this.node.addEventListener('mousemove', this.setupPopupPosition);
  };

  onChartElementClick = (element) => {
    if (!element) {
      if (this.state.focusedAttributeValue) {
        this.setState({
          focusedAttributeValue: null,
        });
      }
      return;
    }
    /* eslint no-underscore-dangle: ['error', { 'allow': ['_model'] }] */
    const focusedAttributeValue = element._model.label;
    this.setState({
      focusedAttributeValue,
    });
  };

  onLegendClick = (fieldName) => {
    this.props.onChangeLegend(fieldName, this.getConfig);
  };

  setupPopupPosition = ({ pageX, pageY }) => {
    this.left = pageX;
    this.top = pageY;
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

  getPopupActionItems = () => [
    {
      id: 'drillDown',
      icon: SearchIcon,
      title: 'Drill down',
      onClick: this.drillDown,
      disabled: this.state.activeAttributes.length > 0,
    },
    {
      id: 'showFilter',
      icon: FiltersIcon,
      title: 'Show filter',
      onClick: this.showFilter,
    },
  ];

  updateActiveAttributesAndFetchWidget = (fetchWidgetSuccessCallback = () => {}) => {
    const { focusedAttributeValue, activeAttributes } = this.state;
    const activeAttribute = {
      key: this.getAttributes()[activeAttributes.length],
      value: focusedAttributeValue,
    };
    const newActiveAttributes = [...activeAttributes, activeAttribute];
    this.setState(
      {
        activeAttribute,
        activeAttributes: newActiveAttributes,
        focusedAttributeValue: null,
      },
      () => {
        this.props
          .fetchWidget({
            attributes: this.state.activeAttributes,
          })
          .then(fetchWidgetSuccessCallback);
      },
    );
  };

  drillDown = () => this.updateActiveAttributesAndFetchWidget();

  showFilter = () => this.updateActiveAttributesAndFetchWidget(this.showDetailsView);

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
          isDetailsView: false,
          activeAttribute:
            newAttributes.length > 0 ? newAttributes[newAttributes.length - 1] : null,
          activeAttributes: newAttributes,
        });
      });
  };

  showDetailsView = () => {
    this.setState({
      isDetailsView: true,
    });
  };

  render() {
    const { isPreview, uncheckedLegendItems, userSettings, container, widget } = this.props;
    const {
      legendItems,
      chartData,
      activeAttribute,
      activeAttributes,
      isDetailsView,
      focusedAttributeValue,
    } = this.state;
    const chartHeight = container.offsetHeight - LEGEND_HEIGHT;
    const isChartDataAvailable = chartData && !!chartData.labels.length;

    return this.state && this.state.chartData ? (
      <div className={cx('cumulative-trend-chart', { 'preview-view': isPreview })}>
        {isDetailsView ? (
          <CumulativeDetails
            widget={widget}
            activeAttribute={activeAttribute}
            activeAttributes={activeAttributes}
            onClose={this.closeDetails}
            isChartDataAvailable={isChartDataAvailable}
          />
        ) : (
          <Fragment>
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
                isChartDataAvailable={isChartDataAvailable}
              />
            )}
            <ChartJS
              chartData={chartData}
              chartOptions={this.state.chartOptions}
              onChartElementClick={this.onChartElementClick}
              onChartCreated={this.onChartCreated}
              height={chartHeight}
            />
          </Fragment>
        )}
        {focusedAttributeValue &&
          isChartDataAvailable && (
            <VirtualPopup positionConfig={{ left: this.left, top: this.top }}>
              <ActionsPopup items={this.getPopupActionItems()} />
            </VirtualPopup>
          )}
      </div>
    ) : null;
  }
}
