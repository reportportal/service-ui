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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  moveToRootDirectory: {
    id: 'TestCaseLibraryPage.createAsSubfolder',
    defaultMessage: 'Move to root directory',
  },
  folderDestination: {
    id: 'TestCaseLibraryPage.folderDestination',
    defaultMessage: 'Folder destination',
  },
  searchFolderToSelect: {
    id: 'TestCaseLibraryPage.searchFolderToSelect',
    defaultMessage: 'Search folder to select',
  },
  duplicateFolderText: {
    id: 'TestCaseLibraryPage.duplicateFolderText',
    defaultMessage:
      "You're about to move the folder <b>{name}</b> along with its test cases and subfolders to a new location.",
  },
});
