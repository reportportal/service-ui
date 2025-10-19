/*
 * Copyright 2025 EPAM Systems
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

import classNames from 'classnames/bind';
import styles from './statusBar.scss';
import { useMemo, FC } from 'react';
import { MIN_WIDTH_PERCENTAGE } from './statusBar.constants';
import { StatusBarProps } from './statusBar.types';

const cx = classNames.bind(styles) as typeof classNames;

export const StatusBar: FC<StatusBarProps> = ({
  data,
  customClass,
  minWidthPercentage = MIN_WIDTH_PERCENTAGE,
}) => {
  const filteredData = useMemo(() => data.filter((item) => item.value >= 1), [data]);

  const total = useMemo(
    () => filteredData.reduce((sum, item) => sum + item.value, 0),
    [filteredData],
  );

  const statusLines = useMemo(() => {
    let totalWidth = 0;
    const calculatedWidths = filteredData.map((item) => {
      const widthPercentage = (item.value / total) * 100;

      const calculatedWidth =
        widthPercentage < minWidthPercentage ? minWidthPercentage : widthPercentage;

      totalWidth += calculatedWidth;

      return calculatedWidth;
    });

    // Adjust widths to ensure they add up to 100%
    const adjustmentFactor = 100 / totalWidth;
    const adjustedWidths = calculatedWidths.map((width) => width * adjustmentFactor);

    return filteredData.map((item, index) => (
      <div
        key={item.status}
        className={cx('status-line', item.status)}
        style={{
          width: `${adjustedWidths[index]}%`,
        }}
      />
    ));
  }, [filteredData, total, minWidthPercentage]);

  return (
    <div className={cx('status-bar', customClass)} style={{ display: 'flex', width: '100%' }}>
      {statusLines}
    </div>
  );
};
