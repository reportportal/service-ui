/*
 * Copyright 2022 EPAM Systems
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

import { defineMessages } from 'react-intl';
import {
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';

export const messages = defineMessages({
  [BTS_GROUP_TYPE]: {
    id: 'IntegrationsList.bts',
    defaultMessage: 'Bug Tracking Systems',
  },
  [NOTIFICATION_GROUP_TYPE]: {
    id: 'IntegrationsList.notification',
    defaultMessage: 'Notifications',
  },
  [AUTHORIZATION_GROUP_TYPE]: {
    id: 'IntegrationsList.authorization',
    defaultMessage: 'Authorization',
  },
  [OTHER_GROUP_TYPE]: {
    id: 'IntegrationsList.other',
    defaultMessage: 'Other',
  },
  noIntegrationsMessage: {
    id: 'IntegrationsCase.noIntegrationsMessage',
    defaultMessage: 'No integrations',
  },
  noIntegrationsDescription: {
    id: 'IntegrationsCase.noIntegrationsDescription',
    defaultMessage: 'Your project has no integrations yet',
  },
  noIntegrationsYet: {
    id: 'IntegrationsCase.noIntegrationsYet',
    defaultMessage: 'No integrations yet',
  },
  noIntegrationsYetDescription: {
    id: 'IntegrationsCase.noIntegrationsYetDescription',
    defaultMessage: 'Integration will appear here once plugins are configured by your team',
  },
});
