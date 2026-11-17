/*!
 * Copyright 2024 EPAM Systems
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
  title: {
    id: 'NoAssignedEmptyPage.title',
    defaultMessage: 'Welcome',
  },
  description: {
    id: 'NoAssignedEmptyPage.description',
    defaultMessage:
      'To get started, you need to join an organization. Contact and receive invitations from members of an existing organization you want to join. For advanced organization configuration reach out to your administrator.',
  },
  descriptionSaaS: {
    id: 'NoAssignedEmptyPage.descriptionSaaS',
    defaultMessage: `To get started, you need to join an organization. Here's how:`,
  },
  existingOrganization: {
    id: 'NoAssignedEmptyPage.existingOrganization',
    defaultMessage: 'Join an existing organization',
  },
  invitations: {
    id: 'NoAssignedEmptyPage.invitations',
    defaultMessage:
      'Contact and receive invitations from members of an existing organization you want to join.',
  },
  createOwnOrganization: {
    id: 'NoAssignedEmptyPage.createOwnOrganization',
    defaultMessage: 'Create your own organization',
  },
  contactUs: {
    id: 'NoAssignedEmptyPage.contactUs',
    defaultMessage: 'Contact us to set up your own organization.',
  },
  reviewPricing: {
    id: 'NoAssignedEmptyPage.reviewPricing',
    defaultMessage: 'Review Pricing',
  },
  or: {
    id: 'NoAssignedEmptyPage.or',
    defaultMessage: 'OR',
  },
});
