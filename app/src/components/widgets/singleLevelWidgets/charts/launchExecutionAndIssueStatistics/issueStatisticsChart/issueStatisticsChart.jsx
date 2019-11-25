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
import { connect } from 'react-redux';
import { defectLinkSelector, TEST_ITEMS_TYPE_LIST } from 'controllers/testItem';
import { defectTypesSelector, orderedDefectFieldsSelector } from 'controllers/project';
import { getDefectTypeLocators } from 'components/widgets/common/utils';
import { DonutChart } from '../common/donutChart';
import { getColumns } from './utils';

@connect((state) => ({
  getDefectLink: defectLinkSelector(state),
  defectTypes: defectTypesSelector(state),
  orderedContentFields: orderedDefectFieldsSelector(state),
}))
export class IssueStatisticsChart extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool,
    defectTypes: PropTypes.object.isRequired,
    orderedContentFields: PropTypes.array.isRequired,
    getDefectLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
    onStatusPageMode: PropTypes.bool,
    heightOffset: PropTypes.number,
  };

  static defaultProps = {
    isPreview: false,
    uncheckedLegendItems: [],
    onStatusPageMode: false,
    heightOffset: 0,
    onChangeLegend: () => {},
    getDefectLink: () => {},
  };

  getChartClickLink = (nameConfig, { isListType, ...params }) => {
    const { getDefectLink, defectTypes } = this.props;
    const link = {
      defects: getDefectTypeLocators(nameConfig, defectTypes),
      ...params,
    };

    if (isListType) {
      return getDefectLink({
        ...link,
        itemId: TEST_ITEMS_TYPE_LIST,
      });
    }

    return getDefectLink(link);
  };

  render() {
    const { defectTypes, orderedContentFields, getDefectLink, ...props } = this.props;

    return (
      <DonutChart
        {...props}
        chartText={'ISSUES'}
        getLink={this.getChartClickLink}
        configParams={{ getColumns, defectTypes, orderedContentFields }}
      />
    );
  }
}
