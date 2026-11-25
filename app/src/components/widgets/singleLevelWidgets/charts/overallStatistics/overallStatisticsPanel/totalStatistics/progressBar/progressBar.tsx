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

import { useMemo, useRef } from 'react';
import classNames from 'classnames/bind';
import type { EChartsType } from 'echarts/core';
import { FAILED, INTERRUPTED } from 'common/constants/testStatuses';
import { EChart } from 'components/widgets/common/echarts';
import type { EChartsOption } from 'components/widgets/common/echarts/types';
import { getStatusOption } from '../../config/getOption';
import styles from './progressBar.scss';

const cx = classNames.bind(styles);

interface ProgressBarProps {
  values: Record<string, number>;
  separateInterrupted?: boolean;
  onChartClick: (...statuses: string[]) => void;
}

const getClickStatuses = (id: string, separateInterrupted: boolean): string[] => {
  if (id === FAILED) {
    return separateInterrupted ? [FAILED] : [FAILED, INTERRUPTED];
  }
  return [id];
};

export const ProgressBar = ({
  values,
  separateInterrupted = false,
  onChartClick,
}: ProgressBarProps) => {
  const latestRef = useRef({ onChartClick, separateInterrupted });
  latestRef.current = { onChartClick, separateInterrupted };

  const option = useMemo(
    () => getStatusOption({ content: [{ values }], separateInterrupted }) as EChartsOption,
    [values, separateInterrupted],
  );

  const handleChartCreated = (_node: HTMLElement, chart: EChartsType) => {
    chart.on('click', (params: { componentType?: string; data?: unknown }) => {
      const { id } = (params.data ?? {}) as { id?: string };

      if (params.componentType === 'series' && id) {
        const { onChartClick: handleClick, separateInterrupted: separate } = latestRef.current;
        handleClick(...getClickStatuses(id, separate));
      }
    });
  };

  return (
    <EChart
      option={option}
      className={cx('container')}
      chartCreatedCallback={handleChartCreated}
    />
  );
};
