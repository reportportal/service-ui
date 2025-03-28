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
    id: 'ListOfVersionsPage.emptyTitle',
    defaultMessage: 'No Product versions yet',
  },
  emptyPageDescription: {
    id: 'ListOfVersionsPage.emptyDescription',
    defaultMessage:
      'Add your first Product version to let you effectively manage and track the Launches on each version of your product',
  },
  numerableBlockTitle: {
    id: 'ListOfVersionsPage.numerableBlock.title',
    defaultMessage: 'Why is it beneficial?',
  },
  stayOrganizedBenefit: {
    id: 'ListOfVersionsPage.stayOrganizedBenefit',
    defaultMessage:
      '<strong>Stay Organized:</strong> Product versions help organize your tests and manage their settings in one place, ensuring efficiency and saving time',
  },
  beUpToDateBenefit: {
    id: 'ListOfVersionsPage.beUpToDateBenefit',
    defaultMessage:
      '<strong>Be Up-to-Date:</strong> Mark tests as default to use the latest version for the next run. Stay updated without any extra hassle.',
  },
  enhanceTrackingBenefit: {
    id: 'ListOfVersionsPage.enhanceTrackingBenefit',
    defaultMessage:
      '<strong>Enhance Tracking:</strong> Understand the evolution of your product by comparing tests across different versions. This will boost your product analysis.',
  },
});
