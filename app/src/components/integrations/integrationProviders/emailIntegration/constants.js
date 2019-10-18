/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  [AUTH_ENABLED_KEY]: false,
  [PROTOCOL_KEY]: 'smtp',
  [SSL_KEY]: false,
  [TLS_KEY]: false,
  [USERNAME_KEY]: '',
  [PASSWORD_KEY]: '',
};
