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
  editLaunch: {
    id: 'EditManualLaunchModal.editLaunch',
    defaultMessage: 'Edit Launch',
  },
  descriptionPlaceholder: {
    id: 'EditManualLaunchModal.descriptionPlaceholder',
    defaultMessage: 'Describe the launch',
  },
  testPlanPlaceholder: {
    id: 'EditManualLaunchModal.testPlanPlaceholder',
    defaultMessage: 'Select the Test Plan',
  },
  testPlanChangedTitle: {
    id: 'EditManualLaunchModal.testPlanChangedTitle',
    defaultMessage: 'Test plan changed',
  },
  testPlanChangedWarning: {
    id: 'EditManualLaunchModal.testPlanChangedWarning',
    defaultMessage:
      'Changing the test plan will affect its coverage. Test cases in this launch will be automatically added to the newly selected test plan.',
  },
  testPlanRemovedTitle: {
    id: 'EditManualLaunchModal.testPlanRemovedTitle',
    defaultMessage: 'Test plan removed',
  },
  testPlanRemovedWarning: {
    id: 'EditManualLaunchModal.testPlanRemovedWarning',
    defaultMessage:
      'Removing the test plan will affect its coverage. Test cases in this launch will no longer count toward any test plan.',
  },
  launchUpdatedSuccess: {
    id: 'EditManualLaunchModal.launchUpdatedSuccess',
    defaultMessage: 'Launch "{launchName}" updated successfully',
  },
  launchUpdateFailed: {
    id: 'EditManualLaunchModal.launchUpdateFailed',
    defaultMessage: 'Failed to update launch',
  },
});
