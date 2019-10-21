/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createTooltipRenderer } from 'components/widgets/common/tooltip';
import { IssueTypeStatTooltip } from '../../../common/issueTypeStatTooltip';
import { calculateTooltipParams } from '../../common/config/utils';

export const getConfig = ({
  content,
  isPreview,
  formatMessage,
  contentFields,
  configParams: { getColumns, ...params },
  onRendered,
  positionCallback,
  onChartClick,
}) => {
  const { columns, colors } = getColumns(content, contentFields, params);
  const legendItems = columns.map((item) => item[0]);

  return {
    customData: {
      legendItems,
    },
    data: {
      columns,
      type: 'donut',
      order: null,
      colors,
      onclick: isPreview ? null : onChartClick,
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 85,
    },
    legend: {
      show: false,
    },
    donut: {
      title: 0,
      label: {
        show: !isPreview,
      },
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: createTooltipRenderer(IssueTypeStatTooltip, calculateTooltipParams, {
        ...params,
        formatMessage,
      }),
    },
    onrendered: onRendered,
  };
};
