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

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

export const getIssueTitle = (
  formatMessage,
  btsIntegrations,
  isBtsPluginsExist,
  enabledBtsPlugins,
  isPostIssueUnavailable,
) => {
  if (!isBtsPluginsExist) {
    return formatMessage(COMMON_LOCALE_KEYS.NO_BTS_PLUGIN);
  }

  if (!enabledBtsPlugins.length) {
    return formatMessage(COMMON_LOCALE_KEYS.NO_AVAILABLE_BTS_PLUGIN);
  }

  if (!btsIntegrations.length) {
    return formatMessage(COMMON_LOCALE_KEYS.NO_BTS_INTEGRATION);
  }

  if (isPostIssueUnavailable) {
    return formatMessage(COMMON_LOCALE_KEYS.BTS_INTEGRATION_NOT_CONFIGURED);
  }

  return '';
};
