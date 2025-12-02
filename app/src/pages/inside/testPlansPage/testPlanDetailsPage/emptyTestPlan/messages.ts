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
  pageHeader: {
    id: 'EmptyTestPlan.header',
    defaultMessage: 'No Test Cases added yet',
  },
  pageDescription: {
    id: 'EmptyTestPlan.description',
    defaultMessage:
      'To set up Launches for your Milestone, begin by selecting tests from the Test Case Library. This ensures you address all essential testing areas!',
  },
});
