import { LDAP_PREFIX, ENABLED_KEY } from '../../../common/constants';

export const DOMAIN_KEY = 'domain';
export const URL_KEY = 'url';
export const BASE_DN_KEY = 'baseDn';
export const EMAIL_KEY = 'synchronizationAttributes.email';
export const FULL_NAME_KEY = 'synchronizationAttributes.fullName';
export const PHOTO_KEY = 'synchronizationAttributes.photo';

export const AD_AUTH_TYPE = 'ad';
export const AD_AUTH_FORM = 'activeDirectoryAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [URL_KEY]: LDAP_PREFIX,
  [ENABLED_KEY]: false,
};
