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

import { FormattedMessage } from 'react-intl';
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

const PLUGINS_FILTER_LIST = [
  {
    value: ALL_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.all'} defaultMessage={'All'} />,
  },
  {
    value: INSTALLED_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.installed'} defaultMessage={'Installed'} />,
  },
  {
    value: AUTHORIZATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.auth'} defaultMessage={'Authorization'} />,
  },
  {
    value: BTS_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.bts'} defaultMessage={'Bug Tracking Systems'} />,
  },
  {
    value: NOTIFICATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.notifications'} defaultMessage={'Notifications'} />,
  },
  {
    value: IMPORT_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.import'} defaultMessage={'Launches Import'} />,
  },
  {
    value: OTHER_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.other'} defaultMessage={'Other'} />,
  },
];

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
