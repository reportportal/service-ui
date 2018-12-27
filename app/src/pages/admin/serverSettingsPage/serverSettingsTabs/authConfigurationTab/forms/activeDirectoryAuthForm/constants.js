import { LDAP_ATTRIBUTES_KEY, LDAP_PREFIX, ENABLED_KEY, URL_KEY } from '../../../common/constants';

export const DOMAIN_KEY = 'domain';

export const AD_AUTH_TYPE = 'ad';
export const AD_AUTH_FORM = 'activeDirectoryAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  [LDAP_ATTRIBUTES_KEY]: {
    [URL_KEY]: LDAP_PREFIX,
  },
};
