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
  header: {
    id: 'EnvironmentsPage.createEnvironmentModalHeader',
    defaultMessage: 'Create Environment',
  },
  nameFieldPlaceholder: {
    id: 'EnvironmentsPage.createEnvironmentModalNameFieldPlaceholder',
    defaultMessage: 'Enter Environment name',
  },
  testDataFieldLabel: {
    id: 'EnvironmentsPage.createEnvironmentModalTestDataFieldLabel',
    defaultMessage: 'Test data (optional)',
  },
  testDataFieldPlaceholder: {
    id: 'EnvironmentsPage.createEnvironmentModalTestDataFieldPlaceholder',
    defaultMessage:
      'Enter the data that will be included to each test execution linked to this environment.',
  },
  testDataSourceTitle: {
    id: 'EnvironmentsPage.createEnvironmentModalTestDataSourceTitle',
    defaultMessage: 'Specify the test data source',
  },
  testDataSourceDescription: {
    id: 'EnvironmentsPage.createEnvironmentModalTestDataSourceDescription',
    defaultMessage:
      'Define and manage the sets of data used during testing, ensuring that tests are executed with the appropriate and relevant data',
  },
  noAvailableDataset: {
    id: 'EnvironmentsPage.createEnvironmentModalNoAvailableDataset',
    defaultMessage: 'No available datasets yet',
  },
  createNewDataset: {
    id: 'EnvironmentsPage.createEnvironmentModalCreateNewDataset',
    defaultMessage: 'Create new dataset',
  },
});
