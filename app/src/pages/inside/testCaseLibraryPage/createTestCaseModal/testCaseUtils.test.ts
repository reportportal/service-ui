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

import { ManualScenarioType } from '../types';
import { buildManualScenario, buildTestCaseData, processFolder } from './testCaseUtils';

describe('processFolder', () => {
  it('sends testFolderId when the selected folder has an id', () => {
    const result = processFolder({
      id: 52,
      name: 'Test',
      description: 'Test',
      fullPath: 'Test',
    });

    expect(result.payload).toEqual({ testFolderId: 52 });
    expect(result.existingFolderId).toBe(52);
    expect(result.newFolderDetails).toBeUndefined();
  });

  it('sends testFolderId for an existing folder even when fullPath is missing', () => {
    const result = processFolder({
      id: 52,
      name: 'Test',
    } as Parameters<typeof processFolder>[0]);

    expect(result.payload).toEqual({ testFolderId: 52 });
    expect(result.existingFolderId).toBe(52);
    expect(result.newFolderDetails).toBeUndefined();
  });

  it('creates a new folder only when the value is a name without an id', () => {
    const result = processFolder('Test');

    expect(result.payload).toEqual({ testFolder: { name: 'Test' } });
    expect(result.existingFolderId).toBeUndefined();
    expect(result.newFolderDetails).toEqual({ name: 'Test', parentTestFolderId: undefined });
  });

  it('creates a nested new folder from NewFolderData', () => {
    const result = processFolder({ name: 'New folder', parentTestFolderId: 10 });

    expect(result.payload).toEqual({
      testFolder: { name: 'New folder', parentTestFolderId: 10 },
    });
    expect(result.existingFolderId).toBeUndefined();
  });

  it('keeps parentTestFolderId when it is 0', () => {
    const result = processFolder({ name: 'New folder', parentTestFolderId: 0 });

    expect(result.payload).toEqual({
      testFolder: { name: 'New folder', parentTestFolderId: 0 },
    });
  });
});

describe('requirements in the create/update request body', () => {
  const formData = {
    name: 'Case',
    folder: { id: 1, name: 'F', fullPath: 'F' },
    manualScenarioType: ManualScenarioType.TEXT,
    requirements: [
      { key: 'srv-1', id: 'srv-1', value: 'REQ-1' },
      { key: '_new', value: 'REQ-2' },
      { key: '_blank', value: ' ' },
    ],
  } as Parameters<typeof buildManualScenario>[0];

  const requirementsOf = (persistedIds?: Set<string>) =>
    buildTestCaseData(formData, buildManualScenario(formData, persistedIds), []).manualScenario
      .requirements;

  it('create sends values only', () => {
    expect(requirementsOf()).toEqual([{ value: 'REQ-1' }, { value: 'REQ-2' }]);
  });

  it('duplicate sends values only even though the form rows carry the original ids', () => {
    expect(requirementsOf(new Set())).toEqual([{ value: 'REQ-1' }, { value: 'REQ-2' }]);
  });

  it('edit keeps ids of the loaded test case and sends new rows without id', () => {
    expect(requirementsOf(new Set(['srv-1']))).toEqual([
      { id: 'srv-1', value: 'REQ-1' },
      { value: 'REQ-2' },
    ]);
  });

  it('never sends the client key', () => {
    [requirementsOf(), requirementsOf(new Set(['srv-1']))].forEach((requirements) =>
      requirements.forEach((requirement) => expect(requirement).not.toHaveProperty('key')),
    );
  });
});
