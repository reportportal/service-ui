import { validate } from 'common/utils';

export const validateLdapAttributes = (ldapAttributes) => ({
  url:
    (!ldapAttributes || !ldapAttributes.url || !validate.urlPart(ldapAttributes.url)) &&
    'requiredFieldHint',
  baseDn: (!ldapAttributes || !ldapAttributes.baseDn) && 'requiredFieldHint',
  synchronizationAttributes: {
    email:
      (!ldapAttributes ||
        !ldapAttributes.synchronizationAttributes ||
        !ldapAttributes.synchronizationAttributes.email) &&
      'requiredFieldHint',
  },
});
