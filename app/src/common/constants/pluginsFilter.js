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

import { defineMessages } from 'react-intl';
import {
  ALL_GROUP_TYPE,
  BTS_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  OTHER_GROUP_TYPE,
  IMPORT_GROUP_TYPE,
} from './pluginsGroupTypes';

// Descriptors, not rendered elements: the kit's Dropdown takes `label: string`, so a consumer
// has to be able to format these itself rather than receive JSX it cannot turn back into text.
export const PLUGINS_FILTER_MESSAGES = defineMessages({
  [ALL_GROUP_TYPE]: { id: 'PluginsFilter.all', defaultMessage: 'All' },
  [AUTHORIZATION_GROUP_TYPE]: { id: 'PluginsFilter.auth', defaultMessage: 'Authorization' },
  [NOTIFICATION_GROUP_TYPE]: { id: 'PluginsFilter.notifications', defaultMessage: 'Notifications' },
  [IMPORT_GROUP_TYPE]: { id: 'PluginsFilter.import', defaultMessage: 'Launches Import' },
  [BTS_GROUP_TYPE]: { id: 'PluginsFilter.bts', defaultMessage: 'Bug Tracking Systems' },
  [OTHER_GROUP_TYPE]: { id: 'PluginsFilter.other', defaultMessage: 'Other' },
});

/**
 * The chips, in the order the design fixes them: `All`, then the registry's controlled category
 * vocabulary in the order the plan lists it.
 *
 * <p>The order is a design decision rather than a property of the data, so it is written out here
 * and must not be sorted by count or alphabetically. The vocabulary itself only changes with a
 * release of service-marketplace.
 *
 * <p>There is deliberately no `Installed` chip. Category and status are independent axes and the
 * page already expresses status as two groups — `Installed` first with a count, then `Available` —
 * so a chip would make one axis selectable in two controls that then have to agree. It also had no
 * defined behaviour on a screen with nothing installed, where there is no Installed group for it
 * to filter.
 */
const PLUGINS_FILTER_LIST = [
  ALL_GROUP_TYPE,
  BTS_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  IMPORT_GROUP_TYPE,
  OTHER_GROUP_TYPE,
].map((value) => ({ value, message: PLUGINS_FILTER_MESSAGES[value] }));

// Real plugin group types, which is every chip but the synthetic All.
export const PLUGIN_FILTER_GROUP_VALUES = PLUGINS_FILTER_LIST.filter(
  (item) => item.value !== ALL_GROUP_TYPE,
).map((item) => item.value);

export const getPluginsFilter = (values = []) =>
  PLUGINS_FILTER_LIST.filter(
    (item) => item.value === ALL_GROUP_TYPE || values.includes(item.value),
  );
