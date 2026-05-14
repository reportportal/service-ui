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

import { TEST_PLANS_PAGE_EVENTS } from 'analyticsEvents/testPlansPageEvents';

export const KEBAB_START_EVENT_MAP = {
  edit: TEST_PLANS_PAGE_EVENTS.CLICK_START_EDIT_TEST_PLAN,
  duplicate: TEST_PLANS_PAGE_EVENTS.CLICK_START_DUPLICATE_TEST_PLAN,
  delete: TEST_PLANS_PAGE_EVENTS.CLICK_START_DELETE_TEST_PLAN,
} as const;
