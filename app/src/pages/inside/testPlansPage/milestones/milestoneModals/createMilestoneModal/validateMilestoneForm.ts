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

import { isBefore } from 'date-fns';
import { defineMessages, type MessageDescriptor } from 'react-intl';

import { commonValidators } from 'common/utils/validation';

import { parseDateOnly } from '../../milestoneDateUtils';

import type { MilestoneFormValues } from './types';

const validationMessages = defineMessages({
  invalidDateOnly: {
    id: 'MilestonesTable.invalidDateOnly',
    defaultMessage: 'Enter a valid date',
  },
  endDateBeforeStartDate: {
    id: 'MilestonesTable.endDateBeforeStartDate',
    defaultMessage: 'End date must be on or after start date',
  },
});

export const createValidateMilestoneForm =
  (formatMessage: (descriptor: MessageDescriptor) => string) =>
  (values: MilestoneFormValues) => {
    const errors: Record<string, string> = {};

    const nameErr = commonValidators.requiredField(values.name);
    if (nameErr) errors.name = nameErr;

    const typeErr = commonValidators.requiredField(values.type);
    if (typeErr) errors.type = typeErr;

    const startReq = commonValidators.requiredField(values.startDate);
    if (startReq) errors.startDate = startReq;

    const endReq = commonValidators.requiredField(values.endDate);
    if (endReq) errors.endDate = endReq;

    const start = values.startDate?.trim() ?? '';
    const end = values.endDate?.trim() ?? '';

    if (!errors.startDate && !errors.endDate && start && end) {
      const startParsed = parseDateOnly(start);
      const endParsed = parseDateOnly(end);
      if (!startParsed) {
        errors.startDate = formatMessage(validationMessages.invalidDateOnly);
      } else if (!endParsed) {
        errors.endDate = formatMessage(validationMessages.invalidDateOnly);
      } else if (isBefore(endParsed, startParsed)) {
        errors.endDate = formatMessage(validationMessages.endDateBeforeStartDate);
      }
    }

    return errors;
  };
