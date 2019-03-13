import { INTEGRATION_ENABLED_KEY } from 'components/integrations';

export const EMAIL_SERVER_FORM = 'emailServerTabForm';
export const INTEGRATION_PARAMETERS_KEY = 'integrationParameters';
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
  [INTEGRATION_ENABLED_KEY]: true,
  [INTEGRATION_PARAMETERS_KEY]: {
    [AUTH_ENABLED_KEY]: false,
    [PROTOCOL_KEY]: 'smtp',
    [SSL_KEY]: false,
    [TLS_KEY]: false,
    [USERNAME_KEY]: '',
    [PASSWORD_KEY]: '',
  },
};
