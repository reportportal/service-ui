import { ENABLED_KEY } from 'pages/admin/serverSettingsPage/common/constants';

export const EMAIL_SERVER_FORM = 'emailServerTabForm';
export const AUTH_ENABLED_KEY = 'authEnabled';
export const PROTOCOL_KEY = 'protocol';
export const SSL_KEY = 'sslEnabled';
export const TLS_KEY = 'starTlsEnabled';
export const FROM_KEY = 'from';
export const HOST_KEY = 'host';
export const PORT_KEY = 'port';
export const USERNAME_KEY = 'username';
export const PASSWORD_KEY = 'password';

export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  [AUTH_ENABLED_KEY]: false,
  [PROTOCOL_KEY]: 'smtp',
  [SSL_KEY]: false,
  [TLS_KEY]: false,
  [USERNAME_KEY]: '',
  [PASSWORD_KEY]: '',
};
