/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import * as d3 from 'd3-selection';
import { ALL } from 'common/constants/reservedFilterIds';
import { defectTypesSelector } from 'controllers/project';
import { defectLinkSelector, statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import {
  getDefaultTestItemLinkParams,
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
    projectId: activeProjectSelector(state),
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
    intl: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    widget: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    defectTypes: PropTypes.object.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    observer: PropTypes.object,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
    clickable: PropTypes.bool,
  };

  static defaultProps = {
    isPreview: false,
    observer: undefined,
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
    clickable: true,
  };

  onChartCreated = () => {
    // eslint-disable-next-line func-names
    d3.selectAll(this.props.container.querySelectorAll('.c3-chart-bar path')).each(function() {
      const elem = d3.select(this);
      if (elem.datum().value === 0) {
        elem.style('stroke-width', '3px');
      }
    });
  };

  onChartClick = (data) => {
    const { widget, getDefectLink, getStatisticsLink, defectTypes, projectId } = this.props;

    const nameConfig = getItemNameConfig(data.id);
    const id = widget.content.result[data.index].id;
    const defaultParams = getDefaultTestItemLinkParams(projectId, ALL, id);
    const defectLocators = getDefectTypeLocators(nameConfig, defectTypes);

    const link = defectLocators
      ? getDefectLink({ defects: defectLocators, itemId: id })
      : getStatisticsLink({ statuses: [nameConfig.defectType.toUpperCase()] });
    this.props.navigate(Object.assign(link, defaultParams));
  };

  getConfigData = () => {
    const {
      intl: { formatMessage },
      widget: { contentParameters },
      defectTypes,
      clickable,
    } = this.props;

    return {
      formatMessage,
      defectTypes,
      getConfig,
      contentFields: contentParameters.contentFields,
      onChartClick: clickable ? this.onChartClick : undefined,
    };
  };

  render() {
    const { onChangeLegend, uncheckedLegendItems, clickable } = this.props;
    const legendConfig = {
      onChangeLegend,
      showLegend: clickable,
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
