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
