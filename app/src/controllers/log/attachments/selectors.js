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

import { createSelector } from 'reselect';
import { attachmentsSelector } from 'controllers/log/selectors';
import { activeProjectSelector } from 'controllers/user';
import { createAttachment } from './utils';

export const logsWithAttachmentsSelector = (state) =>
  attachmentsSelector(state).logsWithAttachments || [];

export const attachmentsLoadingSelector = (state) => attachmentsSelector(state).loading || false;

export const attachmentsPaginationSelector = (state) => attachmentsSelector(state).pagination || {};

export const activeAttachmentIdSelector = (state) => attachmentsSelector(state).activeAttachmentId;

export const attachmentItemsSelector = createSelector(
  logsWithAttachmentsSelector,
  activeProjectSelector,
  (logItems, projectId) =>
    logItems
      .filter((item) => !!item.binaryContent)
      .map((item) => item.binaryContent)
      .map((attachment) => createAttachment(attachment, projectId)),
);
