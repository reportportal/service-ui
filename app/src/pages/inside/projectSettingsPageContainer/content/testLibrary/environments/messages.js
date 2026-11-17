/*
 * Copyright 2025 EPAM Systems
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
  emptyPageTitle: {
    id: 'EnvironmentsPage.emptyTitle',
    defaultMessage: 'No Environments',
  },
  emptyPageDescription: {
    id: 'EnvironmentsPage.emptyDescription',
    defaultMessage:
      'Create a new environment to start managing your test configurations. <br /> Once established, environments will be displayed here for use in your launches.',
  },
  emptyPageButtonText: {
    id: 'EnvironmentsPage.emptyButtonText',
    defaultMessage: 'Create Environment',
  },
  numerableBlockTitle: {
    id: 'EnvironmentsPage.numerableBlock.title',
    defaultMessage: 'Why is it beneficial?',
  },
  emptyPageFirstBenefit: {
    id: 'EnvironmentsPage.emptyPageFirstBenefit',
    defaultMessage:
      'Standardized environment configurations enhance test consistency, reducing variability and boosting reliability',
  },
  emptyPageSecondBenefit: {
    id: 'EnvironmentsPage.emptyPageSecondBenefit',
    defaultMessage:
      'Linking test data to environments streamlines data handling, ensuring correct data usage without manual effort',
  },
  emptyPageThirdBenefit: {
    id: 'EnvironmentsPage.emptyPageThirdBenefit',
    defaultMessage:
      'Environment configurations enable easy test scaling and quick adjustments, helping manage various scenarios efficiently',
  },
});
