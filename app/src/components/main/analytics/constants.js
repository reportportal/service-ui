/*
 * Copyright 2021 EPAM Systems
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

import { LEVEL_STEP, LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { STEP_PAGE_EVENTS, SUITES_PAGE_EVENTS, TESTS_PAGE_EVENTS } from './events';

export const pageEventsMap = {
  [LEVEL_STEP]: STEP_PAGE_EVENTS,
  [LEVEL_TEST]: TESTS_PAGE_EVENTS,
  [LEVEL_SUITE]: SUITES_PAGE_EVENTS,
};

export const GA_4_FIELD_LIMIT = 100;
