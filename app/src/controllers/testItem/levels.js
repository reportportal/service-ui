/*
 * Copyright 2019 EPAM Systems
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

import { LEVEL_SUITE, LEVEL_TEST, LEVEL_STEP } from 'common/constants/launchLevels';
import { NAMESPACE as TEST_NAMESPACE } from 'controllers/test';
import { NAMESPACE as SUITE_NAMESPACE } from 'controllers/suite';
import { NAMESPACE as STEP_NAMESPACE } from 'controllers/step';

export const LEVELS = {
  [LEVEL_SUITE]: {
    order: 0,
    namespace: SUITE_NAMESPACE,
  },
  [LEVEL_TEST]: {
    order: 1,
    namespace: TEST_NAMESPACE,
  },
  [LEVEL_STEP]: {
    order: 2,
    namespace: STEP_NAMESPACE,
  },
};
