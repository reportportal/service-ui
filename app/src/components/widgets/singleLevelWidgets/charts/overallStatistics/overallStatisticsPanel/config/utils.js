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

import { FAILED, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/testStatuses';
import { DEFECTS } from 'components/widgets/common/constants';
import { getChartColor } from 'components/widgets/common/chartColors';
import { getItemColor, getItemName, getItemNameConfig } from 'components/widgets/common/utils';

export const TOTAL_FIELD = 'statistics$executions$total';

const STATUS_FIELDS = {
  [PASSED]: 'statistics$executions$passed',
  [FAILED]: 'statistics$executions$failed',
  [INTERRUPTED]: 'statistics$executions$interrupted',
  [SKIPPED]: 'statistics$executions$skipped',
};

export const getStatusItems = (values, separateInterrupted) =>
  [PASSED, FAILED, ...(separateInterrupted ? [INTERRUPTED] : []), SKIPPED].map((status) => ({
    id: status,
    value: values[STATUS_FIELDS[status]] ?? 0,
    color: getChartColor(STATUS_FIELDS[status]),
  }));

export const getDefectItems = ({
  values,
  orderedContentFields,
  contentFields,
  defectTypes,
  formatMessage,
}) =>
  orderedContentFields
    .filter((key) => contentFields.includes(key) && getItemNameConfig(key).itemType === DEFECTS)
    .map((key) => ({
      key,
      name: getItemName({ itemName: key, defectTypes, formatMessage }),
      value: values[key] || 0,
      color: getItemColor(key, defectTypes),
    }));
