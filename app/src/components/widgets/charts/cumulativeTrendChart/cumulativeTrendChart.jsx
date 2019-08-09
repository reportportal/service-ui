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
    activeAttributes: [],
    isDetailsView: false,
    activeAttribute: null,
    isActionsPopupShown: false,
    selectedItem: null,
  };

  componentDidMount = () => {
    this.getConfig();
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.widget, this.props.widget)) {
      this.getConfig();
    }
  }

  onChartElementClick = (element, event) => {
    if (!element) {
      if (this.state.isActionsPopupShown) {
        this.hideActionsPopup();
      }
      return;
    }
    /* eslint no-underscore-dangle: ['error', { 'allow': ['_model'] }] */
    const elementModel = element._model;
    this.left = event.offsetX;
    this.top = event.offsetY + LEGEND_HEIGHT;
    const selectedItem = this.getSelectedItem(elementModel.label);

    this.setState({
      selectedItem,
      isActionsPopupShown: true,
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
      isActionsPopupShown: false,
      selectedItem: null,
      chartData: {
        labels,
        datasets,
      },
      chartOptions,
      legendItems,
    });
  };

  getAttributes = () => this.props.widget.contentParameters.widgetOptions.attributes;

  getSelectedItem = (focusedAttributeValue) =>
    this.props.widget.content.result.find((item) => item.attributeValue === focusedAttributeValue);

  getPopupActionItems = () => [
    {
      id: 'drillDown',
      icon: SearchIcon,
      title: 'Drill down',
      onClick: this.drillDown,
      disabled: this.getAttributes().length <= this.state.activeAttributes.length + 1,
    },
    {
      id: 'showFilter',
      icon: FiltersIcon,
      title: 'Show filter',
      onClick: this.showFilter,
    },
  ];

  updateActiveAttributes = (actionSuccessCallback) => {
    const { selectedItem, activeAttributes } = this.state;
    const activeAttribute = {
      key: this.getAttributes()[activeAttributes.length],
      value: selectedItem.attributeValue,
    };
    const newActiveAttributes = [...activeAttributes, activeAttribute];

    this.setState(
      {
        activeAttribute,
        activeAttributes: newActiveAttributes,
        isActionsPopupShown: false,
      },
      actionSuccessCallback,
    );
  };

  drillDown = () => this.updateActiveAttributes(this.fetchWidgetWithActiveAttributes);

  showFilter = () => this.updateActiveAttributes(this.showDetailsView);

  userSettingsChangeHandler = (data) => this.props.onChangeUserSettings(data, this.getConfig);

  hideActionsPopup = () =>
    this.setState({
      isActionsPopupShown: false,
      selectedItem: null,
    });

  fetchWidgetWithActiveAttributes = () => {
    this.props.fetchWidget({
      attributes: this.state.activeAttributes,
    });
  };

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

    this.setState({
      isDetailsView: false,
      activeAttribute: newAttributes.length > 0 ? newAttributes[newAttributes.length - 1] : null,
      activeAttributes: newAttributes,
    });
  };

  showDetailsView = () => {
    this.setState({
      isDetailsView: true,
    });
  };

  render() {
    const { uncheckedLegendItems, userSettings, container } = this.props;
    const {
      legendItems,
      chartData,
      activeAttribute,
      activeAttributes,
      isDetailsView,
      selectedItem,
      isActionsPopupShown,
    } = this.state;
    const chartHeight = container.offsetHeight - LEGEND_HEIGHT;
    const isChartDataAvailable = chartData && !!chartData.labels.length;

    return this.state.chartData ? (
      <div className={cx('cumulative-trend-chart')}>
        {isDetailsView ? (
          <CumulativeDetails
            selectedItem={selectedItem}
            activeAttributes={activeAttributes}
            onClose={this.closeDetails}
            chartHeight={chartHeight}
          />
        ) : (
          <Fragment>
            <CumulativeChartLegend
              items={legendItems}
              attributes={this.getAttributes()}
              activeAttribute={activeAttribute}
              activeAttributes={activeAttributes}
              clearAttributes={this.clearAttributes}
              onClick={this.onLegendClick}
              onChangeUserSettings={this.userSettingsChangeHandler}
              uncheckedLegendItems={uncheckedLegendItems}
              userSettings={userSettings}
              isChartDataAvailable={isChartDataAvailable}
            />
            <ChartJS
              chartData={chartData}
              chartOptions={this.state.chartOptions}
              onChartElementClick={this.onChartElementClick}
              height={chartHeight}
            />
          </Fragment>
        )}
        {isActionsPopupShown && (
          <VirtualPopup
            boundariesElement={container}
            referenceConfig={{
              className: cx('popup-reference'),
              style: { left: this.left, top: this.top },
            }}
          >
            <ActionsPopup items={this.getPopupActionItems()} />
          </VirtualPopup>
        )}
      </div>
    ) : null;
  }
}
