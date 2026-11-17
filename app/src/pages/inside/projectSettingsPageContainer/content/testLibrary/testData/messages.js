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
  tabDescription: {
    id: 'TestData.tabDescription',
    defaultMessage:
      'Test data enable the creation of global parameter variables and specifying their values through datasets, ' +
      'enhancing flexibility in test data management. These variables and their value sets can be linked to project ' +
      'environment configurations and specified directly in test cases. Learn more in <a>Documentation</a>',
  },
  howToGetStarted: {
    id: 'TestData.howToGetStarted',
    defaultMessage: 'How to get started?',
  },
  createList: {
    id: 'TestData.createList',
    defaultMessage:
      '<b>Create a list of parameter variables</b>{br}Compile a comprehensive list of variables to standardize testing conditions across different Environments',
  },
  createDataset: {
    id: 'TestData.createDataset',
    defaultMessage:
      '<b>Create dataset and specify values</b>{br}Create a dataset by defining variables with their values, organised by columns that can be linked to various Environments',
  },
  linkEnvironments: {
    id: 'TestData.linkEnvironments',
    defaultMessage:
      '<b>Link environments to created datasets</b>{br}Connect your datasets to specific Environments, enabling seamless access to test data tailored for your testing needs',
  },
});
