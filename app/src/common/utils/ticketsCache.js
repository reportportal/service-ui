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

import { getStorageItem, setStorageItem } from './storageUtils';

const TICKETS_KEY_SUFFIX = '_tickets';
export const MAX_CACHED_TICKETS = 500;

// BTS ticket details are user data: key them by user so that a shared browser does not leak them.
// The pair is serialized as a JSON array, because both ids may contain '_' and a plain join could collide.
// Without a loaded user (or project) there is no key and nothing is cached.
export const getTicketsStorageKey = (userId, projectKey) =>
  userId && projectKey ? `${JSON.stringify([userId, projectKey])}${TICKETS_KEY_SUFFIX}` : null;

export const getCachedTicket = (storageKey, ticketKey) =>
  (storageKey && getStorageItem(storageKey)?.[ticketKey]) || {};

export const updateCachedTicket = (storageKey, ticketKey, data = {}) => {
  if (!storageKey) {
    return;
  }
  const tickets = { ...(getStorageItem(storageKey) || {}), [ticketKey]: data };
  const keys = Object.keys(tickets);

  if (keys.length > MAX_CACHED_TICKETS) {
    keys
      .sort((a, b) => (tickets[a]?.lastTime || 0) - (tickets[b]?.lastTime || 0))
      .slice(0, keys.length - MAX_CACHED_TICKETS)
      .forEach((key) => delete tickets[key]);
  }

  setStorageItem(storageKey, tickets);
};

const removeTicketCaches = (isRemoved) => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  Object.keys(localStorage)
    .filter((key) => key.endsWith(TICKETS_KEY_SUFFIX) && isRemoved(key))
    .forEach((key) => localStorage.removeItem(key));
};

// removes the ticket caches of every user and project (including the old, user-less keys)
export const clearTicketsCache = () => removeTicketCaches(() => true);

// removes the caches written before the JSON-array key format, which are never read again
export const clearLegacyTicketsCache = () => removeTicketCaches((key) => !key.startsWith('['));
