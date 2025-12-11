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

import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';
import { FolderWithFullPath } from 'controllers/testCase';

import { FolderModalFormValues } from './folderModalFormConfig';

export interface NewFolderData {
  name: string;
  parentTestFolderId?: number | null;
}

export const isNewFolderData = (
  folder: FolderWithFullPath | NewFolderData | null,
): folder is NewFolderData => folder !== null && 'name' in folder && !('fullPath' in folder);

const ROOT_FOLDER: FolderWithFullPath = { id: 0, name: '', fullPath: '', description: '' };

export const getFolderFromFormValues = (
  values: FolderModalFormValues,
): FolderWithFullPath | NewFolderData | null => {
  const isNewMode = values.mode === ButtonSwitcherOption.NEW;

  if (isNewMode) {
    if (!values.folderName) {
      return null;
    }

    return {
      name: values.folderName,
      parentTestFolderId: values.isRootFolder ? null : values.parentFolder?.id,
    };
  }

  if (values.moveToRoot) {
    return ROOT_FOLDER;
  }

  return values.destinationFolder || null;
};
