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

import { validate, commonValidators, bindMessageToValidator } from 'common/utils';
import { LDAP_ATTRIBUTES_KEY, ENABLED_KEY } from './constants';

export const validateLdapAttributes = (ldapAttributes = {}) => ({
  url: bindMessageToValidator(validate.ldapUrl, 'requiredFieldHint')(ldapAttributes.url),
  baseDn: commonValidators.requiredField(ldapAttributes.baseDn),
  synchronizationAttributes: {
    email: bindMessageToValidator(validate.ldapSynchronizationAttributes, 'requiredFieldHint')(
      ldapAttributes.synchronizationAttributes,
    ),
  },
});

export const prepareDataBeforeInitialize = (data) => {
  const enabled = (data[LDAP_ATTRIBUTES_KEY] || {})[ENABLED_KEY];
  let preparedData = {
    [ENABLED_KEY]: enabled,
  };
  if (enabled) {
    preparedData = {
      ...preparedData,
      ...data,
    };
  }
  return preparedData;
};
