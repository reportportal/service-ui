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

import { Buttons } from './types';
import { PROJECT_TEST_PLANS_PAGE, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';

export const EMPTY_STATE_BUTTONS: Buttons[] = [
  {
    name: 'testPlansLink',
    type: PROJECT_TEST_PLANS_PAGE,
  },
  {
    name: 'testLibraryLink',
    type: TEST_CASE_LIBRARY_PAGE,
  },
];
