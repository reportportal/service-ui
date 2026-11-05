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

import { useIntl, defineMessages, MessageDescriptor } from 'react-intl';
import {
  CONDITION_ANY,
  CONDITION_BETWEEN,
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_GREATER_EQ,
  CONDITION_HAS,
  CONDITION_IN,
  CONDITION_LESS_EQ,
  CONDITION_NOT_ANY,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
  CONDITION_NOT_HAS,
  CONDITION_NOT_IN,
} from 'components/filterEntities/constants';
import { ConditionOption } from './types';

const messages = defineMessages({
  contains: {
    id: 'Conditions.cnt',
    defaultMessage: 'Contains',
  },
  notContains: {
    id: 'Conditions.notCnt',
    defaultMessage: 'Not contains',
  },
  equals: {
    id: 'Conditions.eq',
    defaultMessage: 'Equals',
  },
  notEquals: {
    id: 'Conditions.notEq',
    defaultMessage: 'Not equals',
  },
  all: {
    id: 'Conditions.all',
    defaultMessage: 'All',
  },
  withoutAll: {
    id: 'Conditions.withoutAll',
    defaultMessage: 'Without all',
  },
  any: {
    id: 'Conditions.any',
    defaultMessage: 'Any',
  },
  withoutAny: {
    id: 'Conditions.withoutAny',
    defaultMessage: 'Without any',
  },
  allDescription: {
    id: 'Conditions.allDescription',
    defaultMessage: 'Has every listed attribute',
  },
  withoutAllDescription: {
    id: 'Conditions.withoutAllDescription',
    defaultMessage: 'Lacks at least one listed attribute',
  },
  anyDescription: {
    id: 'Conditions.anyDescription',
    defaultMessage: 'Has at least one listed attribute',
  },
  withoutAnyDescription: {
    id: 'Conditions.withoutAnyDescription',
    defaultMessage: 'Has none of the listed attributes',
  },
  hasAnyOf: {
    id: 'ConditionFieldV2.hasAnyOf',
    defaultMessage: 'Has any of',
  },
  without: {
    id: 'ConditionFieldV2.without',
    defaultMessage: 'Without',
  },
  between: {
    id: 'ConditionFieldV2.between',
    defaultMessage: 'Between',
  },
});

const CONDITION_MESSAGES: Record<string, MessageDescriptor> = {
  [CONDITION_CNT]: messages.contains,
  [CONDITION_NOT_CNT]: messages.notContains,
  [CONDITION_EQ]: messages.equals,
  [CONDITION_NOT_EQ]: messages.notEquals,
  [CONDITION_HAS]: messages.all,
  [CONDITION_NOT_HAS]: messages.withoutAll,
  [CONDITION_ANY]: messages.any,
  [CONDITION_NOT_ANY]: messages.withoutAny,
  [CONDITION_IN]: messages.hasAnyOf,
  [CONDITION_NOT_IN]: messages.without,
  [CONDITION_BETWEEN]: messages.between,
};

const CONDITION_DESCRIPTIONS: Partial<Record<string, MessageDescriptor>> = {
  [CONDITION_HAS]: messages.allDescription,
  [CONDITION_NOT_HAS]: messages.withoutAllDescription,
  [CONDITION_ANY]: messages.anyDescription,
  [CONDITION_NOT_ANY]: messages.withoutAnyDescription,
};

const CONDITION_SYMBOLS: Record<string, string> = {
  [CONDITION_EQ]: '=',
  [CONDITION_GREATER_EQ]: '≥',
  [CONDITION_LESS_EQ]: '≤',
};

const NUMERIC_CONDITIONS = new Set([CONDITION_GREATER_EQ, CONDITION_LESS_EQ]);

export const useConditionOptions = (conditions: string[] = []): ConditionOption[] => {
  const { formatMessage } = useIntl();
  const isNumericSet = conditions.some((condition) => NUMERIC_CONDITIONS.has(condition));

  return conditions.map((condition) => {
    const descriptionMessage = CONDITION_DESCRIPTIONS[condition];

    if (isNumericSet) {
      return {
        value: condition,
        label: CONDITION_SYMBOLS[condition] ?? condition,
      };
    }

    return {
      value: condition,
      label: CONDITION_MESSAGES[condition]
        ? formatMessage(CONDITION_MESSAGES[condition])
        : condition,
      ...(descriptionMessage ? { description: formatMessage(descriptionMessage) } : {}),
    };
  });
};
