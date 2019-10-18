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

import { FormattedMessage } from 'react-intl';
import { SAUCE_LABS, EMAIL, JIRA, RALLY, SAML } from 'common/constants/integrationNames';

export const INTEGRATIONS_DESCRIPTIONS_MAP = {
  [SAUCE_LABS]: (
    <FormattedMessage
      id="Integrations.SauceLabs.description"
      defaultMessage="Configure an integration with Sauce Labs and watch video of test executions right in the ReportPortal application. For that carry out three easy steps: 1. Configure an  integration with Sauce Labs 2. Add attributes to test items SLID: N (where N - # of job in Sauce Labs) and SLDC: M (where M is US or EU) 3. Watch video on the log level."
    />
  ),
  [EMAIL]: (
    <FormattedMessage
      id="Integrations.Email.description"
      defaultMessage="Reinforce your ReportPortal instance with E-mail server integration. Be informed about test result finish in real time and easily configure list of recipients."
    />
  ),
  [JIRA]: (
    <FormattedMessage
      id="Integrations.Jira.description"
      defaultMessage="Integration with JIRA, can be required for projects that collect defects in a separate tracking tool. Integration provides an exchange of information between ReportPortal and JIRA, such as posting issues and linking issues, getting updates on their statuses."
    />
  ),
  [RALLY]: (
    <FormattedMessage
      id="Integrations.Rally.description"
      defaultMessage="Integration with Rally, can be required for projects that collect defects in a separate tracking tool. Integration provides an exchange of information between ReportPortal and Rally, such as posting issues and linking issues, getting updates on their statuses."
    />
  ),
  [SAML]: (
    <FormattedMessage
      id="Integrations.Saml.description"
      defaultMessage="Integration with SAML, can be help to speed up the process user creation and  login to ReportPortal. Integration provides an exchange of information between ReportPortal and SAML, such as possibility to login to ReportPortal with SAML credentials."
    />
  ),
};
