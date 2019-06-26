import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { defectTypesSelector, orderedContentFieldsSelector } from 'controllers/project';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { createFilterAction } from 'controllers/filter';
import { PASSED, FAILED, SKIPPED, INTERRUPTED } from 'common/constants/testStatuses';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { Legend } from 'components/widgets/charts/common/legend';
import { ChartJS } from 'components/widgets/charts/common/chartjs';
import {
  getItemNameConfig,
  getDefectTypeLocators,
  getUpdatedFilterWithTime,
} from '../common/utils';
import { TOTAL_KEY } from './constants';
import { getChartData } from './chartJsConfig';
import styles from './launchStatisticsChart.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    orderedContentFields: orderedContentFieldsSelector(state),
    getDefectLink: (params) => defectLinkSelector(state, params),
    getStatisticsLink: (params) => statisticsLinkSelector(state, params),
  }),
  {
    navigate: (linkAction) => linkAction,
    createFilterAction,
  },
)
export class LaunchStatisticsChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func,
    widget: PropTypes.object.isRequired,
    project: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    createFilterAction: PropTypes.func,
    isPreview: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    navigate: () => {},
    getDefectLink: () => {},
    getStatisticsLink: () => {},
    createFilterAction: () => {},
    isPreview: false,
    isFullscreen: false,
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
  };

  state = {
    isConfigReady: false,
    chartOptions: {},
    legendItems: [],
    chartData: {},
    disabledFields: [],
  };

  componentDidMount() {
    !this.props.isPreview && this.props.observer.subscribe('widgetResized', this.resizeChart);
    this.getConfig();
  }

  componentWillUnmount() {
    this.chart = null;
  }

  onChartElementClick = (element, dataset) => {
    this.onChartClick({
      id: dataset.label,
      /* eslint no-underscore-dangle: ["error", { "allow": ["_index"] }] */
      index: element._index,
    });
  };

  onChartClick = (data) =>
    this.configData.isTimeLine
      ? this.timeLineModeClickHandler(data)
      : this.launchModeClickHandler(data);

  onLegendClick = (fieldName) => {
    this.toggleField(fieldName, this.getConfig);
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.project,
      filterId: 'all',
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

  getLinkParametersStatuses = ({ defectType }) => {
    if (defectType === TOTAL_KEY) {
      return [PASSED, FAILED, SKIPPED, INTERRUPTED];
    }
    return [defectType.toUpperCase()];
  };

  getConfig = () => {
    const { widget } = this.props;

    if (!widget.content || !Object.keys(widget.content).length) {
      return;
    }

    this.prepareChartData();

    const { labels, datasets, chartOptions, legendItems } = getChartData(widget, {
      ...this.state,
      isPreview: this.props.isPreview,
      formatMessage: this.props.intl.formatMessage,
      isTimeLine: this.configData.isTimeLine,
    });

    this.setState({
      isConfigReady: true,
      chartData: {
        labels,
        datasets,
      },
      chartOptions,
      legendItems,
    });
  };

  setupConfigData = (data, isTimeLine) => {
    const itemData = [];

    data.sort((a, b) => a.startTime - b.startTime).forEach((item) => {
      const currentItemData = {
        ...item,
      };
      delete currentItemData.values;
      itemData.push(currentItemData);
    });

    this.configData = {
      itemData,
      isTimeLine,
    };
  };

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

  launchModeClickHandler = (data) => {
    const { widget, getDefectLink, getStatisticsLink, defectTypes } = this.props;
    const nameConfig = getItemNameConfig(data.id);
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const locators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = locators
      ? getDefectLink({ defects: locators, itemId: id })
      : getStatisticsLink({ statuses: this.getLinkParametersStatuses(nameConfig) });
    this.props.navigate(Object.assign(link, defaultParams));
  };

  timeLineModeClickHandler = (data) => {
    const chartFilter = this.props.widget.appliedFilters[0];
    const itemDate = this.configData.itemData[data.index].date;
    const newFilter = getUpdatedFilterWithTime(chartFilter, itemDate);

    this.props.createFilterAction(newFilter);
  };

  prepareChartData = () => {
    const {
      widget: {
        content: { result },
        contentParameters: { widgetOptions },
      },
    } = this.props;

    const data = [];
    const isTimeLine = widgetOptions.timeline === MODES_VALUES[CHART_MODES.TIMELINE_MODE];

    if (isTimeLine) {
      Object.keys(result).forEach((item) => {
        data.push({
          date: item,
          values: result[item].values,
        });
      });
    }

    this.setupConfigData(data, isTimeLine);
  };

  render() {
    const {
      isPreview,
      widget: {
        contentParameters: { widgetOptions },
      },
    } = this.props;
    const { chartData, chartOptions, legendItems } = this.state;
    const classes = cx({ 'preview-view': isPreview });
    let chartType;

    if (chartData) {
      chartType =
        widgetOptions.viewMode === MODES_VALUES[CHART_MODES.BAR_VIEW]
          ? MODES_VALUES[CHART_MODES.BAR_VIEW]
          : MODES_VALUES[CHART_MODES.LINE_VIEW];
    }

    return chartType && this.state && this.state.chartData ? (
      <div className={classes}>
        <ChartJS
          type={chartType}
          chartData={chartData}
          chartOptions={chartOptions}
          onChartElementClick={this.onChartElementClick}
        >
          {isPreview ? null : (
            <Legend
              items={legendItems}
              activeAttribute={this.state.activeAttribute}
              clearAttributes={this.clearAttributes}
              onClick={this.onLegendClick}
              onChangeFocusType={this.onChangeFocusType}
              onChangeTotals={this.onChangeTotals}
              onChangeSeparate={this.onChangeSeparate}
              onChangePercentage={this.onChangePercentage}
            />
          )}
        </ChartJS>
      </div>
    ) : null;
  }
}
