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

// Special filter that shows only installed plugins (no available-to-install section).
export const INSTALLED_GROUP_TYPE = 'INSTALLED';

// Descriptors, not rendered elements: the kit's Dropdown takes `label: string`, so a consumer
// has to be able to format these itself rather than receive JSX it cannot turn back into text.
export const PLUGINS_FILTER_MESSAGES = defineMessages({
  [ALL_GROUP_TYPE]: { id: 'PluginsFilter.all', defaultMessage: 'All' },
  [INSTALLED_GROUP_TYPE]: { id: 'PluginsFilter.installed', defaultMessage: 'Installed' },
  [AUTHORIZATION_GROUP_TYPE]: { id: 'PluginsFilter.auth', defaultMessage: 'Authorization' },
  [NOTIFICATION_GROUP_TYPE]: { id: 'PluginsFilter.notifications', defaultMessage: 'Notifications' },
  [IMPORT_GROUP_TYPE]: { id: 'PluginsFilter.import', defaultMessage: 'Launches Import' },
  [BTS_GROUP_TYPE]: { id: 'PluginsFilter.bts', defaultMessage: 'Bug Tracking Systems' },
  [OTHER_GROUP_TYPE]: { id: 'PluginsFilter.other', defaultMessage: 'Other' },
});

const PLUGINS_FILTER_LIST = [
  ALL_GROUP_TYPE,
  INSTALLED_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  IMPORT_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
].map((value) => ({ value, message: PLUGINS_FILTER_MESSAGES[value] }));

// Real plugin group types (excludes the synthetic All / Installed filters).
export const PLUGIN_FILTER_GROUP_VALUES = PLUGINS_FILTER_LIST.filter(
  (item) => item.value !== ALL_GROUP_TYPE && item.value !== INSTALLED_GROUP_TYPE,
).map((item) => item.value);

export const getPluginsFilter = (values = []) =>
  PLUGINS_FILTER_LIST.filter(
    (item) =>
      item.value === ALL_GROUP_TYPE ||
      item.value === INSTALLED_GROUP_TYPE ||
      values.includes(item.value),
  );
