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

/**
 * Version history reads newest first. The registry publishes an order of its own, so the list is
 * sorted here rather than trusted to arrive sorted; a version with no publish date sinks, since
 * nothing can be claimed about where it belongs.
 */
export const sortVersionsNewestFirst = (versions) =>
  [...versions].sort((a, b) => {
    const left = Date.parse(a.publishedAt) || 0;
    const right = Date.parse(b.publishedAt) || 0;

    return right - left;
  });

/**
 * A publish or block date is a date the registry states, not a moment this instance experienced,
 * so it is rendered in UTC: west of Greenwich a midnight timestamp would otherwise be shown as
 * the day before, and the alert copy would then disagree with the registry.
 *
 * An unparseable timestamp renders as nothing at all rather than as `Invalid Date`.
 */
export const formatPublishDate = (formatDate, value) =>
  Number.isNaN(Date.parse(value))
    ? ''
    : formatDate(value, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
