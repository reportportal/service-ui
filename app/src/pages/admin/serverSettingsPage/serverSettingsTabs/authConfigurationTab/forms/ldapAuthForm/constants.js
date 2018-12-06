import { LDAP_PREFIX, ENABLED_KEY } from '../../../common/constants';

export const URL_KEY = 'url';
export const BASE_DN_KEY = 'baseDn';
export const MANAGER_DN_KEY = 'managerDn';
export const MANAGER_PASSWORD_KEY = 'managerPassword';
export const USER_DN_PATTERN_KEY = 'userDnPattern';
export const USER_SEARCH_FILTER_KEY = 'userSearchFilter';
export const GROUP_SEARCH_BASE_KEY = 'groupSearchBase';
export const GROUP_SEARCH_FILTER_KEY = 'groupSearchFilter';
export const PASSWORD_ENCODER_TYPE_KEY = 'passwordEncoderType';
export const PASSWORD_ATTRIBUTE_KEY = 'passwordAttribute';
export const EMAIL_KEY = 'synchronizationAttributes.email';
export const FULL_NAME_KEY = 'synchronizationAttributes.fullName';
export const PHOTO_KEY = 'synchronizationAttributes.photo';

export const LDAP_AUTH_TYPE = 'ldap';
export const LDAP_AUTH_FORM = 'ldapAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [URL_KEY]: LDAP_PREFIX,
  [PASSWORD_ENCODER_TYPE_KEY]: '',
  [ENABLED_KEY]: false,
};
