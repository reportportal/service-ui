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

import { BtsPropertiesForIssueForm } from 'components/integrations/elements/bts';
import { EmailFormFields, SauceLabsFormFields } from 'components/integrations/integrationProviders';
import { JIRA, RALLY, EMAIL, SAUCE_LABS } from 'common/constants/pluginNames';

export const JIRA_CLOUD = 'JIRA Cloud';
export const AZURE_DEVOPS = 'Azure DevOps';

export const btsFormField = {
  [JIRA]: BtsPropertiesForIssueForm,
  [RALLY]: BtsPropertiesForIssueForm,
  [EMAIL]: EmailFormFields,
  [SAUCE_LABS]: SauceLabsFormFields,
};
