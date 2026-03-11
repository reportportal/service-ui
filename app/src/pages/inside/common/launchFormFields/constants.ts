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

import { LaunchFormData } from './types';

export const INITIAL_LAUNCH_FORM_VALUES: LaunchFormData = {
  name: '',
  description: '',
  attributes: [],
  uncoveredTestsOnly: false,
};

export const LAUNCH_FORM_FIELD_NAMES = {
  NAME: 'name',
  DESCRIPTION: 'description',
  ATTRIBUTES: 'attributes',
  UNCOVERED_TESTS_ONLY: 'uncoveredTestsOnly',
  TEST_PLAN: 'testPlan',
} as const;

export const PAGE_SIZE = 50;
