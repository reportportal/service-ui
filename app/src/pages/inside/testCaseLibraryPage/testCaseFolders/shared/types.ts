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

import { MouseEvent } from 'react';

import { FolderWithFullPath } from 'controllers/testCase';

import { PARENT_FIELD_NAME } from './commonConstants';

export type FormFieldValue = string | boolean | number | null | undefined;

export interface BaseFormValues {
  [key: string]: FormFieldValue;
}

export interface FolderFormValues {
  folderName: string;
  parentFolder?: FolderWithFullPath | null;
  isToggled?: boolean;
}

export interface DuplicateFolderFormValues extends BaseFormValues {
  folderName: string;
  destinationFolderName?: string;
  initialParentFolderId?: number | null;
  isParentFolderToggled?: boolean;
}

export type BoundChangeFunction = (field: string, value: FormFieldValue) => void;

export type BoundUntouchFunction = (field: string) => void;

export interface HandleSubmitFunction {
  (onSubmit: (values: FolderFormValues) => void): (event: MouseEvent<HTMLButtonElement>) => void;
}

export interface FolderFormState {
  form: {
    [PARENT_FIELD_NAME]: {
      values: {
        parentFolder?: FolderWithFullPath;
      };
    };
  };
}
