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

import {
  MAX_CACHED_TICKETS,
  clearTicketsCache,
  getCachedTicket,
  getTicketsStorageKey,
  updateCachedTicket,
} from './ticketsCache';

describe('ticketsCache', () => {
  beforeEach(() => localStorage.clear());

  it('keys the cache by user and project', () => {
    expect(getTicketsStorageKey(5, 'proj')).toBe('[5,"proj"]_tickets');
  });

  it('does not share a key between user and project pairs that join to the same string', () => {
    expect(getTicketsStorageKey('alice_demo', 'test')).not.toBe(
      getTicketsStorageKey('alice', 'demo_test'),
    );
  });

  it('does not cache tickets before the user is loaded', () => {
    const key = getTicketsStorageKey(undefined, 'proj');
    updateCachedTicket(key, 'jira_A-1', { lastTime: 10 });

    expect(key).toBeNull();
    expect(getCachedTicket(key, 'jira_A-1')).toEqual({});
    expect(localStorage).toHaveLength(0);
  });

  it('stores and reads a ticket', () => {
    const key = getTicketsStorageKey(5, 'proj');
    updateCachedTicket(key, 'jira_A-1', { issue: { id: 1 }, lastTime: 10 });

    expect(getCachedTicket(key, 'jira_A-1')).toEqual({ issue: { id: 1 }, lastTime: 10 });
    expect(getCachedTicket(key, 'jira_missing')).toEqual({});
  });

  it('evicts the oldest entries beyond the cap', () => {
    const key = getTicketsStorageKey(5, 'proj');
    for (let i = 1; i <= MAX_CACHED_TICKETS + 1; i += 1) {
      updateCachedTicket(key, `t${i}`, { lastTime: i });
    }
    const stored = JSON.parse(localStorage.getItem(key));

    expect(Object.keys(stored)).toHaveLength(MAX_CACHED_TICKETS);
    expect(stored.t1).toBeUndefined();
    expect(stored.t2).toBeDefined();
    expect(stored[`t${MAX_CACHED_TICKETS + 1}`]).toBeDefined();
  });

  it('clears ticket caches of all users and keeps other keys', () => {
    updateCachedTicket(getTicketsStorageKey(5, 'proj'), 'a', {});
    updateCachedTicket('5_proj_tickets', 'a', {});
    updateCachedTicket('proj_tickets', 'a', {});
    localStorage.setItem('5_settings', '{}');
    clearTicketsCache();

    expect(localStorage.getItem(getTicketsStorageKey(5, 'proj'))).toBeNull();
    expect(localStorage.getItem('5_proj_tickets')).toBeNull();
    expect(localStorage.getItem('proj_tickets')).toBeNull();
    expect(localStorage.getItem('5_settings')).toBe('{}');
  });
});
