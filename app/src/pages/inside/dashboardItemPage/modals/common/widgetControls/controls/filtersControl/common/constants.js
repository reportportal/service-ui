/*
 * Copyright 2019 EPAM Systems
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

import {
  ENTITY_NUMBER,
  ENTITY_NAME,
  CONDITION_CNT,
  ENTITY_START_TIME,
} from 'components/filterEntities/constants';

export const FILTER_ADD_FORM = 'FilterAddFrom';

export const FORM_APPEARANCE_MODE_EDIT = 'formAppearanceModeEdit';
export const FORM_APPEARANCE_MODE_ADD = 'formAppearanceModeAdd';
export const FORM_APPEARANCE_MODE_LOCKED = 'formAppearanceModeLocked';

export const FILTER_NAME_KEY = 'name';

export const getOrdersWithDefault = (column) => [
  { sortingColumn: column, isAsc: false },
  { sortingColumn: ENTITY_NUMBER, isAsc: false },
];

export const NEW_FILTER_DEFAULT_CONFIG = {
  share: false,
  type: 'launch',
  conditions: [{ filteringField: ENTITY_NAME, value: '', condition: CONDITION_CNT }],
  orders: getOrdersWithDefault(ENTITY_START_TIME),
};
