/*
 * Copyright 2019 EPAM Systems
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

import { ZIP, JAR } from 'common/constants/fileTypes';

export const MODAL_TYPE_IMPORT_LAUNCH = 'import';
export const MODAL_TYPE_UPLOAD_PLUGIN = 'upload';

export const ACCEPT_FILE_MIME_TYPES = {
  [MODAL_TYPE_IMPORT_LAUNCH]: [
    'application/zip',
    'application/x-zip-compressed',
    'application/zip-compressed',
  ],
  [MODAL_TYPE_UPLOAD_PLUGIN]: ['.jar'],
};

export const ACCEPT_FILE_TYPES_ABBR = {
  [MODAL_TYPE_IMPORT_LAUNCH]: ZIP,
  [MODAL_TYPE_UPLOAD_PLUGIN]: JAR,
};

export const MAX_FILE_SIZES = {
  [MODAL_TYPE_IMPORT_LAUNCH]: 33554432,
  [MODAL_TYPE_UPLOAD_PLUGIN]: 134217728,
};
