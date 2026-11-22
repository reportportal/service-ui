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

import { buildRequirementsRQ, getRequirementIds } from './requirementsUtils';

describe('requirementsUtils', () => {
  const rows = [
    { key: 'a', id: 'uuid-1', value: 'REQ-1' },
    { key: '_new1', value: 'REQ-2' },
    { key: 'b', id: 'foreign', value: 'REQ-3' },
    { key: '_new2', value: '   ' },
  ];

  describe('getRequirementIds', () => {
    test('collects only the ids that are present', () => {
      expect(getRequirementIds(rows)).toEqual(new Set(['uuid-1', 'foreign']));
      expect(getRequirementIds(undefined)).toEqual(new Set());
    });
  });

  describe('buildRequirementsRQ', () => {
    test('keeps ids only for persisted requirements and drops blank values', () => {
      expect(buildRequirementsRQ(rows, new Set(['uuid-1']))).toEqual([
        { id: 'uuid-1', value: 'REQ-1' },
        { value: 'REQ-2' },
        { value: 'REQ-3' },
      ]);
    });

    test('sends values only when there are no persisted ids (create, duplicate)', () => {
      expect(buildRequirementsRQ(rows)).toEqual([
        { value: 'REQ-1' },
        { value: 'REQ-2' },
        { value: 'REQ-3' },
      ]);
    });

    test('never emits a client key', () => {
      const [first] = buildRequirementsRQ(rows, new Set(['uuid-1']));

      expect(first).not.toHaveProperty('key');
    });
  });
});
