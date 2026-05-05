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
  addAndCreateLaunchTitle: {
    id: 'TestPlanDropZones.addAndCreateLaunchTitle',
    defaultMessage: 'Add and create launch',
  },
  addAndCreateLaunchHint: {
    id: 'TestPlanDropZones.addAndCreateLaunchHint',
    defaultMessage:
      'Drop items here to add test cases to the Test Plan and create a launch from the selected tests.',
  },
  addToTestPlanTitle: {
    id: 'TestPlanDropZones.addToTestPlanTitle',
    defaultMessage: 'Add to Test Plan',
  },
  addToTestPlanHint: {
    id: 'TestPlanDropZones.addToTestPlanHint',
    defaultMessage: 'Drop items here to add selected tests to the Test Plan.',
  },
  cancelAddingTitle: {
    id: 'TestPlanDropZones.cancelAddingTitle',
    defaultMessage: 'Cancel adding',
  },
  cancelAddingHint: {
    id: 'TestPlanDropZones.cancelAddingHint',
    defaultMessage: 'Drop here to cancel adding to the test plan.',
  },
});