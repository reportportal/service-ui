/*
 * Copyright 2026 EPAM Systems
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

export const messages = defineMessages({
  premiumPopupTitle: {
    id: 'premiumPromoModal.title',
    defaultMessage: 'Unlock premium features',
  },
  premiumPopupSubtitle: {
    id: 'premiumPromoModal.subtitle',
    defaultMessage:
      'Upgrade your plan to get the most out of ReportPortal and work more efficiently.',
  },
  premiumBulletQualityGates: {
    id: 'premiumPromoModal.feature.qualityGates',
    defaultMessage: 'Quality Gates',
  },
  premiumBulletOrganizations: {
    id: 'premiumPromoModal.feature.organizations',
    defaultMessage: 'Organizations',
  },
  premiumBulletTestExecutions: {
    id: 'premiumPromoModal.feature.testExecutions',
    defaultMessage: 'Test Executions Search',
  },
  premiumBulletSSO: {
    id: 'premiumPromoModal.feature.sso',
    defaultMessage: 'Single sign-on',
  },
  premiumBulletMore: {
    id: 'premiumPromoModal.feature.more',
    defaultMessage: 'and many more\u2026',
  },
  explorePlansButton: {
    id: 'premiumPromoModal.explorePlansButton',
    defaultMessage: 'Explore Plans',
  },
  contactUsButton: {
    id: 'premiumPromoModal.contactUsButton',
    defaultMessage: 'Contact us',
  },
  notNowButton: {
    id: 'premiumPromoModal.notNowButton',
    defaultMessage: 'Not now',
  },
});