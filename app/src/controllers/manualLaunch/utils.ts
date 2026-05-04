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

import { isNumber } from 'es-toolkit/compat';

import type { Attachment } from './types';

export function mapAttachmentForExecutionCommentPayload(a: Attachment): {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
} {
  return {
    id: String(a.id),
    fileName: a.fileName,
    fileType: a.fileType,
    fileSize: isNumber(a.fileSize) ? a.fileSize : 0,
  };
}

export function isAttachmentRemoved(
  id: string | number,
  removed: Array<string | number>,
): boolean {
  const idStr = String(id);
  return removed.some((r) => String(r) === idStr);
}
