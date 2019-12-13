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
  ANALYZER_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from './pluginsGroupTypes';

const PLUGINS_FILTER_LIST = [
  {
    value: ALL_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.all'} defaultMessage={'All'} />,
  },
  {
    value: OTHER_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.other'} defaultMessage={'Other'} />,
  },
  {
    value: ANALYZER_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.analyzer'} defaultMessage={'Analyzer'} />,
  },
  {
    value: AUTHORIZATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.auth'} defaultMessage={'Authorization'} />,
  },
  {
    value: NOTIFICATION_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.notifications'} defaultMessage={'Notifications'} />,
  },
  {
    value: BTS_GROUP_TYPE,
    label: <FormattedMessage id={'PluginsFilter.bts'} defaultMessage={'Bug Tracking Systems'} />,
  },
];

export const getPluginsFilter = (values = []) =>
  PLUGINS_FILTER_LIST.filter((item) => values.includes(item.value))
    .concat(PLUGINS_FILTER_LIST[0])
    .reverse();
