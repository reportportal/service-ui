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

import moment from 'moment';
import classNames from 'classnames/bind';
import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import styles from '../failedCasesTrendChart.scss';

const cx = classNames.bind(styles);

export const TOOLTIP_DATE_FORMAT = 'DD.MM.YYYY, HH:mm';

const REFERENCE_WIDTH = 668;
const REFERENCE_HEIGHT = 496;
const REFERENCE_LABELS_COUNT = 6;
const PX_PER_X_LABEL = REFERENCE_WIDTH / REFERENCE_LABELS_COUNT;
const PX_PER_Y_LABEL = REFERENCE_HEIGHT / REFERENCE_LABELS_COUNT;
const MIN_LABELS_COUNT = 3;
const MAX_Y_LABELS_COUNT = 13;

const DEFAULT_TICK_INTERVALS = REFERENCE_LABELS_COUNT - 1;

export const getMaxTickIntervals = (chartHeight) => {
  if (!chartHeight) {
    return DEFAULT_TICK_INTERVALS;
  }
  const labelsCount = Math.round(chartHeight / PX_PER_Y_LABEL);

  return Math.min(MAX_Y_LABELS_COUNT, Math.max(MIN_LABELS_COUNT, labelsCount)) - 1;
};

export const getXLabelStep = (count, chartWidth) => {
  const labelsCount = chartWidth
    ? Math.max(MIN_LABELS_COUNT, Math.round(chartWidth / PX_PER_X_LABEL))
    : REFERENCE_LABELS_COUNT;

  return Math.max(1, Math.ceil(count / labelsCount));
};

export const getTicks = (bottom, top, maxIntervals = DEFAULT_TICK_INTERVALS) => {
  const height = top - bottom;
  if (height <= 0) {
    return [bottom];
  }
  const intervals = Math.min(maxIntervals, Math.ceil(height));
  const step = height / intervals;

  return Array.from({ length: intervals + 1 }, (_, index) =>
    index === intervals ? top : bottom + step * index,
  );
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    itemName: `${name} #${number}`,
    startTimeText: moment(new Date(startTime).getTime()).format(TOOLTIP_DATE_FORMAT),
    itemCases: String(value),
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(statusLocalization[FAILED]) },
    wrapperClassName: cx('tooltip'),
  };
};
