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

import { createSelector } from 'reselect';
import { itemsSelector } from 'controllers/testItem';

const domainSelector = (state) => state.itemsHistory || {};
export const itemsHistorySelector = (state) => domainSelector(state).items;
export const historySelector = (state) => domainSelector(state).history;
export const visibleItemsCountSelector = (state) => domainSelector(state).visibleItemsCount;
export const loadingSelector = (state) => domainSelector(state).loading;
export const historyItemsSelector = createSelector(itemsSelector, (testItems) => {
  const launchesToRender = [];

  testItems.forEach((item) => {
    const sameName = launchesToRender.filter((obj) => obj.uniqueId === item.uniqueId);
    if (!sameName.length) {
      launchesToRender.push(item);
    }
  });
  return launchesToRender;
});
