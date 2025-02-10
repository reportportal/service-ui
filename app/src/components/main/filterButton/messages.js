/*
 * Copyright 2024 EPAM Systems
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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  any: {
    id: 'FilterButton.any',
    defaultMessage: 'Any',
  },
  today: {
    id: 'FilterButton.today',
    defaultMessage: 'Today',
  },
  last2days: {
    id: 'FilterButton.last2days',
    defaultMessage: 'Last 2 days',
  },
  last7days: {
    id: 'FilterButton.last7days',
    defaultMessage: 'Last 7 days',
  },
  last30days: {
    id: 'FilterButton.last30days',
    defaultMessage: 'Last 30 days',
  },
  equals: {
    id: 'FilterButton.equals',
    defaultMessage: 'Equals',
  },
  greaterOrEqual: {
    id: 'FilterButton.greaterOrEqual',
    defaultMessage: 'Greater or equal',
  },
  lessOrEqual: {
    id: 'FilterButton.lessOrEqual',
    defaultMessage: 'Less or equal',
  },
  notEqual: {
    id: 'FilterButton.notEqual',
    defaultMessage: 'Not equal',
  },
  contains: {
    id: 'FilterButton.contains',
    defaultMessage: 'Contains',
  },
  notContains: {
    id: 'FilterButton.notContains',
    defaultMessage: 'Not contains',
  },
  helpText: {
    id: 'FilterButton.helpText',
    defaultMessage: 'Only digits are allowed',
  },
  typePersonal: {
    id: 'OrganizationsFilter.typePersonal',
    defaultMessage: 'Personal',
  },
  typeInternal: {
    id: 'OrganizationsFilter.typeInternal',
    defaultMessage: 'Internal',
  },
  typeSynched: {
    id: 'OrganizationsFilter.typeSynced',
    defaultMessage: 'Synched',
  },
});
