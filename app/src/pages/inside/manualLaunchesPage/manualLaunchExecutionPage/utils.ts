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

import { isNotNil } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

import type {
  Attachment,
  ManualScenarioRequirement,
  TestCaseExecution,
} from 'controllers/manualLaunch';
import type { Requirement } from 'types/testCase';
import type { AttachmentWithSlider } from 'pages/inside/common/attachmentsWithSlider/types';
import { getFileExtension } from 'pages/inside/common/attachmentsWithSlider/utils';

export const requirementsToItems = (requirements?: ManualScenarioRequirement[]): Requirement[] =>
  requirements?.map((requirement) => ({ id: requirement.id, value: requirement.value })) ?? [];

export function hasPersistedExecutionComment(
  execution: TestCaseExecution | null | undefined,
): boolean {
  const payload = execution?.executionComment;
  if (!payload) return false;

  return Boolean(payload.comment?.trim()) || !isEmpty(payload.attachments ?? []);
}

const PREVIEWABLE_IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);

export function toAttachmentWithSlider(attachment: Attachment): AttachmentWithSlider {
  const id = Number(attachment.id);
  const ext = getFileExtension(attachment.fileName);
  const hasThumbFlag = (attachment as { hasThumbnail?: boolean }).hasThumbnail;
  const hasThumbnail =
    Boolean(hasThumbFlag) ||
    (Boolean(attachment.fileType) && /^image\//i.test(attachment.fileType)) ||
    (isNotNil(ext) && PREVIEWABLE_IMAGE_EXT.has(ext));

  return {
    id: Number.isFinite(id) ? id : 0,
    fileName: attachment.fileName,
    fileSize: attachment.fileSize,
    fileType: attachment.fileType,
    hasThumbnail,
  };
}
