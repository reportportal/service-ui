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

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { getChartDefaultProps } from 'components/widgets/common/utils';
import { EChart } from 'components/widgets/common/echarts';
import { getOption } from '../common/statusPageChartConfig';
import styles from './issuesStatusPageChart.scss';

const cx = classNames.bind(styles);

export const IssuesStatusPageChart = ({
  widget,
  container,
  isPreview = false,
  observer = {},
  heightOffset,
  interval = null,
  integerValueType = false,
}) => {
  const { formatMessage } = useIntl();

  const configData = useMemo(
    () => ({
      getOption,
      formatMessage,
      interval,
      chartType: MODES_VALUES[CHART_MODES.AREA_VIEW],
      integerValueType,
      wrapperClassName: cx('tooltip-container'),
    }),
    [formatMessage, interval, integerValueType],
  );

  return (
    <div className={cx('issues-status-page-chart')}>
      <EChart
        {...getChartDefaultProps({ widget, container, isPreview, observer, heightOffset })}
        legendConfig={{ showLegend: false }}
        configData={configData}
      />
    </div>
  );
};

IssuesStatusPageChart.propTypes = {
  widget: PropTypes.object.isRequired,
  container: PropTypes.instanceOf(Element).isRequired,
  isPreview: PropTypes.bool,
  observer: PropTypes.object,
  heightOffset: PropTypes.number,
  interval: PropTypes.string,
  integerValueType: PropTypes.bool,
};
