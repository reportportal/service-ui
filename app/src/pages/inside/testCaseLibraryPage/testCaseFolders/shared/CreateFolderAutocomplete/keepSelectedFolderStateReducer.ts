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
import { isString } from 'es-toolkit/compat';

import { FolderWithFullPath } from 'controllers/testCase';
import { NewFolderData } from 'pages/inside/testCaseLibraryPage/utils/getFolderFromFormValues';

export const getFolderAutocompleteLabel = (
  option: FolderWithFullPath | NewFolderData | string | null,
): string => {
  if (!option) {
    return '';
  }

  if (isString(option)) {
    return option;
  }

  if ('fullPath' in option) {
    return option.description || option.name || '';
  }

  return option.name || '';
};

const isUserFolderSelection = (type: StateChangeOptions<unknown>['type']) =>
  type === Downshift.stateChangeTypes.clickItem || type === Downshift.stateChangeTypes.keyDownEnter;

const hasFolderId = (item: unknown): item is { id: number } =>
  Boolean(item) &&
  typeof item === 'object' &&
  'id' in item &&
  typeof (item as { id: unknown }).id === 'number';

export const keepSelectedFolderStateReducer =
  <T>(itemToString: (item: T | null) => string) =>
  (state: DownshiftState<T>, changes: StateChangeOptions<T>): Partial<StateChangeOptions<T>> => {
    if (isUserFolderSelection(changes.type) || changes.selectedItem === undefined) {
      return changes;
    }

    if (changes.selectedItem === null || !hasFolderId(state.selectedItem)) {
      return changes;
    }

    const current = state.selectedItem;
    const currentLabel = itemToString(current);
    const nextInput = (changes.inputValue ?? state.inputValue ?? '').trim();

    if (nextInput !== currentLabel) {
      return changes;
    }

    return { ...changes, selectedItem: current };
  };
