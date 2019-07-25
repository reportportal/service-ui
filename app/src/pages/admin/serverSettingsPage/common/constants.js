import { defineMessages } from 'react-intl';

export const LDAP_ATTRIBUTES_KEY = 'ldapAttributes';
export const ENABLED_KEY = 'enabled';
export const URL_KEY = 'url';
export const BASE_DN_KEY = 'baseDn';
export const EMAIL_KEY = 'synchronizationAttributes.email';
export const FULL_NAME_KEY = 'synchronizationAttributes.fullName';
export const PHOTO_KEY = 'synchronizationAttributes.photo';
export const LDAP_PREFIX = 'ldap://';
export const LDAPS_PREFIX = 'ldaps://';

export const messages = defineMessages({
  updateAuthSuccess: {
    id: 'ServerSettingsTabs.updateAuthSuccess',
    defaultMessage: 'OAuth integration settings were successfully updated',
  },
});
