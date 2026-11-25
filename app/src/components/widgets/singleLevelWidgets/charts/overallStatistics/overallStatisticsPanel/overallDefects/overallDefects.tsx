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
import { useIntl } from 'react-intl';
import type { EChartsType } from 'echarts/core';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EChart } from 'components/widgets/common/echarts';
import type { EChartsOption } from 'components/widgets/common/echarts/types';
import { getDefectItems } from '../config/utils';
import {
  DEFECT_GAP,
  DEFECT_ROW_HEIGHT,
  getDefectsHeight,
  getDefectsOption,
} from '../config/getOption';

interface DefectType {
  locator: string;
  color: string;
  longName: string;
  shortName: string;
}

export interface OverallDefectsProps {
  values: Record<string, number>;
  contentFields: string[];
  orderedContentFields: string[];
  defectTypes: Record<string, DefectType[]>;
  onChartClick: (defectField: string) => void;
}

export const OverallDefects = ({
  values,
  contentFields,
  orderedContentFields,
  defectTypes,
  onChartClick,
}: OverallDefectsProps) => {
  const { formatMessage } = useIntl();
  const latestClickRef = useRef(onChartClick);
  latestClickRef.current = onChartClick;

  const option = useMemo(
    () =>
      getDefectsOption({
        content: [{ values }],
        formatMessage,
        contentFields,
        orderedContentFields,
        defectTypes,
      }) as EChartsOption,
    [values, formatMessage, contentFields, orderedContentFields, defectTypes],
  );

  const defectItems = getDefectItems({
    values,
    orderedContentFields,
    contentFields,
    defectTypes,
    formatMessage,
  }) as unknown[];
  const rowsCount = defectItems.length;

  const handleChartCreated = (_node: HTMLElement, chart: EChartsType) => {
    chart.on('click', (params: { componentType?: string; data?: unknown }) => {
      const { id } = (params.data ?? {}) as { id?: string };

      if (params.componentType === 'series' && id) {
        latestClickRef.current(id);
      }
    });
  };

  return (
    <ScrollWrapper>
      <div style={{ height: getDefectsHeight(rowsCount), overflow: 'hidden' }}>
        <div style={{ height: rowsCount * DEFECT_ROW_HEIGHT, marginTop: -DEFECT_GAP / 2 }}>
          <EChart option={option} chartCreatedCallback={handleChartCreated} />
        </div>
      </div>
    </ScrollWrapper>
  );
};
