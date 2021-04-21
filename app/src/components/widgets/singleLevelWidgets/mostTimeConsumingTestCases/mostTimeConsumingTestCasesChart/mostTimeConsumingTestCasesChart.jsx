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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { ChartContainer } from 'components/widgets/common/c3chart';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { getConfig } from './config/getConfig';
import styles from './mostTimeConsumingTestCasesChart.scss';

const cx = classNames.bind(styles);

export const MostTimeConsumingTestCasesChart = injectIntl((props) => {
  const configData = {
    formatMessage: props.intl.formatMessage,
    getConfig,
    onChartClick: props.onItemClick,
  };

  return (
    <div className={cx('most-time-consuming-chart')}>
      <ChartContainer
        {...getChartDefaultProps(props)}
        legendConfig={{
          showLegend: false,
        }}
        configData={configData}
        className={cx('widget-wrapper')}
      />
    </div>
  );
});
MostTimeConsumingTestCasesChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  onItemClick: PropTypes.func,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
};
MostTimeConsumingTestCasesChart.defaultProps = {
  onItemClick: () => {},
  isPreview: false,
  observer: {},
};
