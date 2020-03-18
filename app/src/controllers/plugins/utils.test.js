/* * Copyright 2020 EPAM Systems
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

import { PLUGIN_NAMES_BY_GROUP_TYPES_MAP, JIRA, LDAP } from 'common/constants/pluginNames';
import { AUTHORIZATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { isAuthorizationPlugin, isPluginSwitchable } from './utils';

describe('isAuthorizationPlugin util function', () => {
  const isPluginWithAuthGroupType = (name) =>
    PLUGIN_NAMES_BY_GROUP_TYPES_MAP[AUTHORIZATION_GROUP_TYPE].includes(name);

  test('should return true in case of plugin with authorization group type', () => {
    const pluginToCheck = LDAP;
    const isAuth = isPluginWithAuthGroupType(pluginToCheck);

    expect(isAuthorizationPlugin(pluginToCheck)).toBe(isAuth);
  });

  test('should return false in case of plugin with any other group type', () => {
    const pluginToCheck = JIRA;
    const isNotAuth = isPluginWithAuthGroupType(pluginToCheck);

    expect(isAuthorizationPlugin(pluginToCheck)).toBe(isNotAuth);
  });
});

describe('isPluginSwitchable util function', () => {
  test('should return true in case of plugin switchable', () => {
    expect(isPluginSwitchable(JIRA)).toBe(true);
  });

  test('should return false in case of plugin not switchable', () => {
    expect(isPluginSwitchable(LDAP)).toBe(false);
  });
});
