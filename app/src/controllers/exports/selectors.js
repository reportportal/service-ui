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

import { createSelector } from 'reselect';
import { EXPORTS_BANNER_VARIANT_DEFAULT } from './constants';

export const exportsSelector = (state) => state.exports?.items ?? [];

export const exportsBannerVariantSelector = (state) =>
  state.exports?.bannerVariant ?? EXPORTS_BANNER_VARIANT_DEFAULT;

export const uniqueEventsInfoByGroupSelector = createSelector(exportsSelector, (items) => {
  const byGroup = {};
  items.forEach((item) => {
    const eventsInfo = item.eventsInfo ?? {};
    const groupId = eventsInfo.groupId ?? 'default';
    if (!byGroup[groupId]) byGroup[groupId] = eventsInfo;
  });
  return Object.values(byGroup);
});
