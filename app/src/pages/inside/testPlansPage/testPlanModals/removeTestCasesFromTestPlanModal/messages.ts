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
  removeFromTestPlanTitle: {
    id: 'RemoveTestCasesFromTestPlanModal.title',
    defaultMessage: 'Remove from Test Plan',
  },
  removeFromTestPlanDescription: {
    id: 'RemoveTestCasesFromTestPlanModal.description',
    defaultMessage:
      'Are you sure you want to remove <b>{count, number}</b> {count, plural, one {item} other {items}} from the <b>{testPlanName}</b>?',
  },
  removeFromTestPlanError: {
    id: 'RemoveTestCasesFromTestPlanModal.errorMessage',
    defaultMessage: 'Failed to remove test cases from the Test Plan',
  },
});
