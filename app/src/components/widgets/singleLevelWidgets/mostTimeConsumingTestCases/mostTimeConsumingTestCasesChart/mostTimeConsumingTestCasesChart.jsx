/*
 * Copyright 2026 EPAM Systems
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

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { EChart } from 'components/widgets/common/echarts';
import { getOption } from './config/getOption';
import styles from './mostTimeConsumingTestCasesChart.scss';

const cx = classNames.bind(styles);

export const MostTimeConsumingTestCasesChart = ({
  widget,
  container,
  onItemClick = () => {},
  isPreview = false,
  observer = {},
}) => {
  const { formatMessage } = useIntl();

  const onChartClick = useCallback(
    (data) => {
      const targetItem = widget.content?.result?.[data.index] || {};

      onItemClick(targetItem.id);
    },
    [onItemClick, widget],
  );

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      onChartClick,
    }),
    [formatMessage, onChartClick],
  );

  return (
    <div className={cx('most-time-consuming-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer })}
        legendConfig={{
          showLegend: false,
        }}
        configData={configData}
        className={cx('widget-wrapper')}
      />
    </div>
  );
};

MostTimeConsumingTestCasesChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  onItemClick: PropTypes.func,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
};
