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

import { getBasicClickEventParameters } from './common/ga4Utils';
import { LAUNCHES_PAGE } from './launchesPageEvents';
import { FILTER_ENTITY_ID_TO_TYPE_MAP } from './common/testItemPages/constants';
import { getFilterEntityType } from './common/testItemPages/utils';
import {
  ENTITY_NAME,
  ENTITY_LAUNCH_TYPE,
  ENTITY_LAUNCH_NAME,
} from 'components/filterEntities/constants';

export const FILTERS_PAGE = 'filters';

const shortenFilterName = (str) =>
  str
    .split('_')
    .map((w) => w.slice(0, 3))
    .join('_');

const getLaunchTypeConditionKey = (value) => {
  if (!value) return 'all';
  const parts = value.split(',').filter(Boolean);
  return parts.length === 1 ? parts[0].toLowerCase() : 'all';
};

export const getAddFilterTypeParam = (conditions = []) =>
  conditions
    .filter(({ value }) => value)
    .map(({ filteringField, value }) => {
      if (filteringField === ENTITY_NAME) {
        return shortenFilterName(FILTER_ENTITY_ID_TO_TYPE_MAP[ENTITY_LAUNCH_NAME]);
      }
      const analyticsType = getFilterEntityType({ id: filteringField });
      if (filteringField === ENTITY_LAUNCH_TYPE) {
        return shortenFilterName(`${analyticsType}_${getLaunchTypeConditionKey(value)}`);
      }
      return shortenFilterName(analyticsType);
    })
    .join('#');

export const getAddEditFilterModalEvents = (isEditMode) => ({
  ...(!isEditMode && {
    clickOkBtn: (type) => ({
      ...getBasicClickEventParameters(LAUNCHES_PAGE),
      modal: 'add_filter',
      element_name: 'add',
      ...(type && { type }),
    }),
  }),
});
