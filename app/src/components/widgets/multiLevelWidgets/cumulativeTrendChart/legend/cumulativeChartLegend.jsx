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

import { Fragment, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Checkbox } from '@reportportal/ui-kit';
import { Legend } from 'components/widgets/common/legend';
import { getChartColor } from 'components/widgets/common/chartColors';
import { CumulativeChartBreadcrumbs } from './cumulativeChartBreadcrumbs';
import styles from './cumulativeChartLegend.scss';

const cx = classNames.bind(styles);
const noop = () => {};
const LEGEND_STYLE_PROPS = {
  className: cx('legend'),
  itemClassName: cx('legend-item'),
  markClassName: cx('legend-mark'),
  labelClassName: cx('legend-label'),
  getColor: getChartColor,
};

function CumulativeChartLegendComponent(props) {
  const {
    onChangeUserSettings,
    attributes = [],
    activeAttribute = null,
    activeAttributes = [],
    clearAttributes = noop,
    userSettings = {},
    isChartDataAvailable = false,
    isPrintMode = false,
    isLegendControlsShown = true,
  } = props;

  const onChangeFocusType = useCallback(
    (e) => {
      onChangeUserSettings({ defectTypes: e.target.checked });
    },
    [onChangeUserSettings],
  );

  const onChangeTotals = useCallback(
    (e) => {
      onChangeUserSettings({ showTotal: e.target.checked });
    },
    [onChangeUserSettings],
  );

  const onChangeSeparate = useCallback(
    (e) => {
      onChangeUserSettings({ separate: e.target.checked });
    },
    [onChangeUserSettings],
  );

  const onChangePercentage = useCallback(
    (e) => {
      onChangeUserSettings({ percentage: e.target.checked });
    },
    [onChangeUserSettings],
  );

  const {
    defectTypes = false,
    showTotal = false,
    separate = false,
    percentage = false,
  } = userSettings;

  return (
    <div className={cx('cumulative-trend-chart-legend')}>
      <div className={cx('legend-first-row')}>
        <CumulativeChartBreadcrumbs
          attributes={attributes}
          activeAttribute={activeAttribute}
          activeAttributes={activeAttributes}
          clearAttributes={clearAttributes}
        />

        {isChartDataAvailable && (
          <Fragment>
            {!isPrintMode && <Legend {...props} {...LEGEND_STYLE_PROPS} />}
            {isLegendControlsShown && (
              <div className={cx('controls')}>
                <Checkbox className={cx('control')} value={defectTypes} onChange={onChangeFocusType}>
                  Defect Types
                </Checkbox>
                <Checkbox className={cx('control')} value={showTotal} onChange={onChangeTotals}>
                  Totals
                </Checkbox>
                <Checkbox className={cx('control')} value={separate} onChange={onChangeSeparate}>
                  Separate
                </Checkbox>
                <Checkbox
                  className={cx('control')}
                  value={percentage}
                  onChange={onChangePercentage}
                >
                  Percentage
                </Checkbox>
              </div>
            )}
          </Fragment>
        )}
      </div>
      {isChartDataAvailable && isPrintMode && (
        <div className={cx('legend-second-row')}>
          <Legend {...props} {...LEGEND_STYLE_PROPS} />
        </div>
      )}
    </div>
  );
}

CumulativeChartLegendComponent.propTypes = {
  onChangeUserSettings: PropTypes.func.isRequired,
  attributes: PropTypes.array,
  activeAttribute: PropTypes.object,
  activeAttributes: PropTypes.array,
  clearAttributes: PropTypes.func,
  userSettings: PropTypes.object,
  isChartDataAvailable: PropTypes.bool,
  isPrintMode: PropTypes.bool,
  isLegendControlsShown: PropTypes.bool,
};

export const CumulativeChartLegend = memo(CumulativeChartLegendComponent);
CumulativeChartLegend.displayName = 'CumulativeChartLegend';
CumulativeChartLegend.propTypes = CumulativeChartLegendComponent.propTypes;
