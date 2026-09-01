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

import { isNumber, isString } from 'es-toolkit/compat';

import { FolderWithFullPath } from 'controllers/testCase';
import { NewFolderData } from 'pages/inside/testCaseLibraryPage/utils/getFolderFromFormValues';

import { getFolderAutocompleteLabel } from './keepSelectedFolderStateReducer';

export const resolveFolderAutocompleteChange = (
  selectedItem: FolderWithFullPath | string | null,
  currentValue?: FolderWithFullPath | NewFolderData | null,
): FolderWithFullPath | NewFolderData | null => {
  if (!selectedItem) {
    return null;
  }

  if (!isString(selectedItem)) {
    return selectedItem;
  }

  if (
    currentValue &&
    typeof currentValue === 'object' &&
    'id' in currentValue &&
    isNumber(currentValue.id) &&
    getFolderAutocompleteLabel(currentValue) === selectedItem
  ) {
    return currentValue;
  }

  return { name: selectedItem };
};
