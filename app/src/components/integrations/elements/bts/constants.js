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

import { defineMessages } from 'react-intl';

export const COMMON_BTS_MESSAGES = defineMessages({
  projectKeyLabel: {
    id: 'BtsCommonMessages.projectKeyLabel',
    defaultMessage: 'Project key in BTS',
  },
  linkToBtsLabel: {
    id: 'BtsCommonMessages.linkToBtsLabel',
    defaultMessage: 'Link to BTS',
  },
  authTypeLabel: {
    id: 'BtsCommonMessages.authTypeLabel',
    defaultMessage: 'Authorization type',
  },
  integrationNameLabel: {
    id: 'BtsCommonMessages.integrationNameLabel',
    defaultMessage: 'Integration Name',
  },
});

export const BTS_FIELDS_FORM = 'BTS_FIELDS_FORM';
export const ISSUE_TYPE_FIELD_KEY = 'issuetype';
