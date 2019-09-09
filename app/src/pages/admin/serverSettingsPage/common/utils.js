import { validate } from 'common/utils';
import { LDAP_ATTRIBUTES_KEY, ENABLED_KEY } from './constants';

export const validateLdapAttributes = (ldapAttributes) => ({
  url:
    (!ldapAttributes ||
      validate.isEmpty(ldapAttributes.url) ||
      !validate.urlPart(ldapAttributes.url)) &&
    'requiredFieldHint',
  baseDn: (!ldapAttributes || validate.isEmpty(ldapAttributes.baseDn)) && 'requiredFieldHint',
  synchronizationAttributes: {
    email:
      (!ldapAttributes ||
        !ldapAttributes.synchronizationAttributes ||
        validate.isEmpty(ldapAttributes.synchronizationAttributes.email)) &&
      'requiredFieldHint',
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
