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
  MANUAL_LAUNCH_NOT_EXECUTED_STATUS_FILTER,
  getNotExecutedCount,
  normalizeExecutionStatusFilter,
  parseExecutionStatusFilter,
  serializeExecutionStatusFilter,
} from './executionStatusFilter';

describe('executionStatusFilter', () => {
  describe('parseExecutionStatusFilter', () => {
    it('returns an empty list for an empty value', () => {
      expect(parseExecutionStatusFilter(undefined)).toEqual([]);
      expect(parseExecutionStatusFilter('')).toEqual([]);
    });

    it('keeps the single To Run value of old links', () => {
      expect(parseExecutionStatusFilter('TO_RUN')).toEqual(['TO_RUN']);
    });

    it('returns known statuses in the fixed order and drops unknown or duplicate values', () => {
      expect(parseExecutionStatusFilter('skipped, PASSED,FOO,TO_RUN,PASSED,IN_PROGRESS')).toEqual([
        'TO_RUN',
        'IN_PROGRESS',
        'PASSED',
        'SKIPPED',
      ]);
    });
  });

  describe('serializeExecutionStatusFilter', () => {
    it('joins statuses in the fixed order', () => {
      expect(serializeExecutionStatusFilter(['FAILED', 'TO_RUN'])).toBe('TO_RUN,FAILED');
    });

    it('returns undefined when nothing valid is selected', () => {
      expect(serializeExecutionStatusFilter([])).toBeUndefined();
      expect(serializeExecutionStatusFilter(['STOPPED'])).toBeUndefined();
    });
  });

  describe('normalizeExecutionStatusFilter', () => {
    it('normalizes a raw query value', () => {
      expect(normalizeExecutionStatusFilter('in_progress,to_run')).toBe('TO_RUN,IN_PROGRESS');
      expect(normalizeExecutionStatusFilter('INFO')).toBeUndefined();
    });
  });

  describe('not executed', () => {
    it('filters by To Run and In Progress', () => {
      expect(MANUAL_LAUNCH_NOT_EXECUTED_STATUS_FILTER).toBe('TO_RUN,IN_PROGRESS');
    });

    it('counts To Run and In Progress executions', () => {
      expect(getNotExecutedCount({ toRun: 2, inProgress: 1 })).toBe(3);
      expect(getNotExecutedCount({ toRun: 0, inProgress: 1 })).toBe(1);
      expect(getNotExecutedCount({})).toBe(0);
    });
  });
});
