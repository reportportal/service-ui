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

import { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { Legend } from 'components/widgets/common/legend';
import { CumulativeChartBreadcrumbs } from './cumulativeChartBreadcrumbs';
import styles from './cumulativeChartLegend.scss';

const cx = classNames.bind(styles);

export class CumulativeChartLegend extends PureComponent {
  static propTypes = {
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

  static defaultProps = {
    attributes: [],
    activeAttribute: null,
    activeAttributes: [],
    clearAttributes: () => {},
    userSettings: {},
    isChartDataAvailable: false,
    isPrintMode: false,
    isLegendControlsShown: true,
  };

  onChangeFocusType = (e) => {
    this.props.onChangeUserSettings({ defectTypes: e.target.checked });
  };

  onChangeTotals = (e) => {
    this.props.onChangeUserSettings({ showTotal: e.target.checked });
  };

  onChangeSeparate = (e) => {
    this.props.onChangeUserSettings({ separate: e.currentTarget.querySelector('input').checked });
  };

  onChangePercentage = (e) => {
    this.props.onChangeUserSettings({ percentage: e.currentTarget.querySelector('input').checked });
  };

  render() {
    const {
      attributes,
      activeAttribute,
      activeAttributes,
      clearAttributes,
      userSettings,
      isChartDataAvailable,
      isPrintMode,
      isLegendControlsShown,
    } = this.props;
    const { defectTypes, showTotal, separate, percentage } = userSettings;
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
              {!isPrintMode && <Legend className={cx('legend')} {...this.props} />}
              {isLegendControlsShown && (
                <div className={cx('controls')}>
                  <div className={cx('control')}>
                    <InputCheckbox value={defectTypes} onChange={this.onChangeFocusType}>
                      Defect Types
                    </InputCheckbox>
                  </div>

                  <div className={cx('control')}>
                    <InputCheckbox
                      className={cx('control')}
                      value={showTotal}
                      onChange={this.onChangeTotals}
                    >
                      Totals
                    </InputCheckbox>
                  </div>

                  <div
                    className={cx('control', 'separate', { 'separate-active': separate })}
                    onClick={this.onChangeSeparate}
                  >
                    <InputCheckbox className={cx('control')} value={separate}>
                      Separate
                    </InputCheckbox>
                  </div>

                  <div
                    className={cx('control', 'percentage', { 'percentage-active': percentage })}
                    onClick={this.onChangePercentage}
                  >
                    <InputCheckbox className={cx('control')} value={percentage}>
                      Percentage
                    </InputCheckbox>
                  </div>
                </div>
              )}
            </Fragment>
          )}
        </div>
        {isChartDataAvailable && isPrintMode && (
          <div className={cx('legend-second-row')}>
            <Legend className={cx('legend')} {...this.props} />
          </div>
        )}
      </div>
    );
  }
}
