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

import Downshift, { DownshiftState, StateChangeOptions } from 'downshift';

import { FolderWithFullPath } from 'controllers/testCase';

import {
  getFolderAutocompleteLabel,
  keepSelectedFolderStateReducer,
} from './keepSelectedFolderStateReducer';
import { resolveFolderAutocompleteChange } from './resolveFolderAutocompleteChange';

const folderA: FolderWithFullPath = {
  id: 48,
  name: 'Test',
  description: 'Test',
  fullPath: 'Root / Test',
};

const folderB: FolderWithFullPath = {
  id: 52,
  name: 'Test',
  description: 'Test',
  fullPath: 'Other / Test',
};

const reduce = keepSelectedFolderStateReducer<FolderWithFullPath | string>(
  getFolderAutocompleteLabel,
);

const apply = (
  selectedItem: FolderWithFullPath | string | null,
  changes: Partial<StateChangeOptions<FolderWithFullPath | string>> & {
    type: StateChangeOptions<FolderWithFullPath | string>['type'];
  },
) =>
  reduce(
    { selectedItem, inputValue: getFolderAutocompleteLabel(selectedItem) } as DownshiftState<
      FolderWithFullPath | string
    >,
    changes as StateChangeOptions<FolderWithFullPath | string>,
  );

describe('keepSelectedFolderStateReducer', () => {
  it('keeps the clicked folder when blur rematches another folder with the same name', () => {
    const result = apply(folderB, {
      type: Downshift.stateChangeTypes.unknown,
      selectedItem: folderA,
      inputValue: 'Test',
    });

    expect(result.selectedItem).toEqual(folderB);
  });

  it('does not collapse the selected folder to a display-name string', () => {
    const result = apply(folderB, {
      type: Downshift.stateChangeTypes.unknown,
      selectedItem: 'Test',
      inputValue: 'Test',
    });

    expect(result.selectedItem).toEqual(folderB);
  });

  it('allows selecting a different same-named folder via click', () => {
    const result = apply(folderA, {
      type: Downshift.stateChangeTypes.clickItem,
      selectedItem: folderB,
      inputValue: 'Test',
    });

    expect(result.selectedItem).toEqual(folderB);
  });

  it('allows creating a new folder when the typed name does not match the selection', () => {
    const result = apply(folderB, {
      type: Downshift.stateChangeTypes.unknown,
      selectedItem: 'Brand new',
      inputValue: 'Brand new',
    });

    expect(result.selectedItem).toBe('Brand new');
  });
});

describe('resolveFolderAutocompleteChange', () => {
  it('keeps the folder object when the autocomplete emits the display name of the selected folder', () => {
    expect(resolveFolderAutocompleteChange('Test', folderB)).toEqual(folderB);
  });

  it('keeps a clicked folder object with id', () => {
    expect(resolveFolderAutocompleteChange(folderB, folderA)).toEqual(folderB);
  });

  it('treats an unmatched typed string as a new folder name', () => {
    expect(resolveFolderAutocompleteChange('Brand new', folderB)).toEqual({ name: 'Brand new' });
  });

  it('returns null when the selection is cleared', () => {
    expect(resolveFolderAutocompleteChange(null, folderB)).toBeNull();
  });
});
