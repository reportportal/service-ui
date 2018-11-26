import { defineMessages } from 'react-intl';

export const ENABLED_KEY = 'enabled';
export const LDAP_PREFIX = 'ldap://';
export const LDAPS_PREFIX = 'ldaps://';

export const messages = defineMessages({
  warningMessage: {
    id: 'ServerSettingsTabs.warningMessage',
    defaultMessage: 'Test connection was failed:',
  },
  updateAuthSuccess: {
    id: 'ServerSettingsTabs.updateAuthSuccess',
    defaultMessage: 'OAuth integration settings were successfully updated',
  },
});
