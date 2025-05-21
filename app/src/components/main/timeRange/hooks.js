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

import { useState } from 'react';
import { format, parse } from 'date-fns';
import { DATE_FORMAT } from 'common/constants/timeDateFormat';
import { LAST_RUN_DATE_FILTER_NAME } from '../filterButton';

export const TIME_RANGE_DIVIDER = '-to-';

export const useTimeRangeState = (entities) => {
  const [initialStartTimeRange, initialEndTimeRange] = entities[
    LAST_RUN_DATE_FILTER_NAME
  ]?.value?.includes(TIME_RANGE_DIVIDER)
    ? entities[LAST_RUN_DATE_FILTER_NAME]?.value?.split(TIME_RANGE_DIVIDER)
    : [];

  const [customStartTimeRange, setCustomStartTimeRange] = useState(
    initialStartTimeRange && parse(initialStartTimeRange, DATE_FORMAT, new Date()),
  );
  const [customEndTimeRange, setCustomEndTimeRange] = useState(
    initialEndTimeRange && parse(initialEndTimeRange, DATE_FORMAT, new Date()),
  );

  const formattedStartTimeRange = customStartTimeRange && format(customStartTimeRange, DATE_FORMAT);
  const formattedEndTimeRange = customEndTimeRange && format(customEndTimeRange, DATE_FORMAT);

  const customDisplayedValue =
    customStartTimeRange &&
    customEndTimeRange &&
    `${formattedStartTimeRange} — ${formattedEndTimeRange}`;

  const customTimeRange =
    customStartTimeRange &&
    customEndTimeRange &&
    `${formattedStartTimeRange}${TIME_RANGE_DIVIDER}${formattedEndTimeRange}`;

  const clearTimeRange = () => {
    setCustomStartTimeRange();
    setCustomEndTimeRange();
  };

  return {
    customStartTimeRange,
    setCustomStartTimeRange,
    customEndTimeRange,
    setCustomEndTimeRange,
    customTimeRange,
    customDisplayedValue,
    clearTimeRange,
  };
};
