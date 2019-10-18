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
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig } from './config/getConfig';
import styles from './nonPassedTestCasesTrendChart.scss';

const cx = classNames.bind(styles);

const FAILED_SKIPPED_STATISTICS_KEY = 'statistics$executions$failedSkippedTotal';

@injectIntl
export class NonPassedTestCasesTrendChart extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    isPreview: PropTypes.bool,
    height: PropTypes.number,
    observer: PropTypes.object,
  };

  static defaultProps = {
    isPreview: false,
    height: 0,
    observer: {},
  };

  configData = {
    getConfig,
    formatMessage: this.props.intl.formatMessage,
  };

  legendConfig = {
    showLegend: true,
    legendProps: {
      items: [FAILED_SKIPPED_STATISTICS_KEY],
      disabled: true,
    },
  };

  render() {
    return (
      <div className={cx('non-passed-cases-trend-chart')}>
        <ChartContainer
          {...getChartDefaultProps(this.props)}
          configData={this.configData}
          legendConfig={this.legendConfig}
        />
      </div>
    );
  }
}
