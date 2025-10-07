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

import { BaseAttachmentFile } from 'common/hooks';

export const downloadFileFromBlob = (file: File, fileName?: string) => {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName || file.name;
  link.click();
  URL.revokeObjectURL(url);
};

export const getFileKey = (file: BaseAttachmentFile) =>
  `${file.fileName}-${file.file.size}-${file.file.lastModified}`;
