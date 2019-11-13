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

import { ENABLED_KEY } from 'pages/admin/serverSettingsPage/common/constants';

export const CLIENT_ID_KEY = 'clientId';
export const CLIENT_SECRET_KEY = 'clientSecret';
export const ORGANIZATIONS_KEY = 'restrictions.organizations';

export const GITHUB_AUTH_FORM = 'githubAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  restrictions: {
    organizations: [],
  },
};
