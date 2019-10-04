import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as d3 from 'd3-selection';
import { ALL } from 'common/constants/reservedFilterIds';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { defectTypesSelector } from 'controllers/project';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import {
  getDefectTypeLocators,
  getItemNameConfig,
  getChartDefaultProps,
} from 'components/widgets/common/utils';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getConfig } from './config/getConfig';
import styles from './launchesComparisonChart.scss';

const cx = classNames.bind(styles);

@injectIntl
@connect(
  (state) => ({
    project: activeProjectSelector(state),
    defectTypes: defectTypesSelector(state),
    getDefectLink: defectLinkSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class LaunchesComparisonChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    navigate: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    project: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
  };

  onChartCreated = () => {
    d3.selectAll(document.querySelectorAll('.c3-chart-bar path')).each(function() {
      const elem = d3.select(this);
      if (elem.datum().value === 0) {
        elem.style('stroke-width', '3px');
      }
    });
  };

  onChartClick = (data) => {
    const { widget, getDefectLink, getStatisticsLink, defectTypes } = this.props;

    const nameConfig = getItemNameConfig(data.id);
    const id = widget.content.result[data.index].id;
    const defaultParams = this.getDefaultLinkParams(id);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = defectLocators
      ? getDefectLink({ defects: defectLocators, itemId: id })
      : getStatisticsLink({ statuses: [nameConfig.defectType.toUpperCase()] });
    this.props.navigate(Object.assign(link, defaultParams));
  };

  getDefaultLinkParams = (testItemIds) => ({
    payload: {
      projectId: this.props.project,
      filterId: ALL,
      testItemIds,
    },
    type: TEST_ITEM_PAGE,
  });

  getConfigData = () => {
    const {
      intl: { formatMessage },
      widget: { contentParameters },
      defectTypes,
    } = this.props;

    return {
      formatMessage,
      defectTypes,
      getConfig,
      contentParameters,
      onChartClick: this.onChartClick,
    };
  };

  render() {
    const { onChangeLegend, uncheckedLegendItems } = this.props;
    const legendConfig = {
      onChangeLegend,
      showLegend: true,
      uncheckedLegendItems,
      legendProps: {
        noTotal: true,
      },
    };

    return (
      <div className={cx('launches-comparison-chart')}>
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          legendConfig={legendConfig}
          configData={this.getConfigData()}
          chartCreatedCallback={this.onChartCreated}
        />
      </div>
    );
  }
}
