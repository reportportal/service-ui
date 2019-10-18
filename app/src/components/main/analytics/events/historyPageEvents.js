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

export const HISTORY_PAGE = 'history';
export const HISTORY_PAGE_EVENTS = {
  SELECT_HISTORY_DEPTH: {
    category: HISTORY_PAGE,
    action: 'Select "history depth"',
    label: 'Show parameter of selected "history depth"',
  },
  CLICK_ON_ITEM: {
    category: HISTORY_PAGE,
    action: 'Click on item',
    label: 'Transition to "Item"',
  },
};
