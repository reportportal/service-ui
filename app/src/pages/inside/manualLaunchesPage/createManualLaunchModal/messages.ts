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
  createLaunch: {
    id: 'CreateManualLaunchModal.createLaunch',
    defaultMessage: 'Create Launch',
  },
  descriptionPlaceholder: {
    id: 'CreateManualLaunchModal.descriptionPlaceholder',
    defaultMessage: 'Provide details about the launch (optional)',
  },
  testPlanPlaceholder: {
    id: 'CreateManualLaunchModal.testPlanPlaceholder',
    defaultMessage: 'Select the Test Plan',
  },
  testPlanHint: {
    id: 'CreateManualLaunchModal.testPlanHint',
    defaultMessage:
      'All test executions in this Launch will automatically be included in the selected Test Plan, and the test results here will impact its coverage.',
  },
});
