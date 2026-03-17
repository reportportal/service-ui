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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  markAsStatus: {
    id: 'ExecutionStatusConfirmModal.markAsStatus',
    defaultMessage: 'Mark as {status}',
  },
  executionComment: {
    id: 'ExecutionStatusConfirmModal.executionComment',
    defaultMessage: 'Execution comment (optional)',
  },
  commentPlaceholder: {
    id: 'ExecutionStatusConfirmModal.commentPlaceholder',
    defaultMessage: 'Add a comment about this test execution',
  },
  postIssueToBts: {
    id: 'ExecutionStatusConfirmModal.postIssueToBts',
    defaultMessage: 'Post or link issue to BTS',
  },
  attachments: {
    id: 'ExecutionStatusConfirmModal.attachments',
    defaultMessage: 'Attachments',
  },
  dropFilesHere: {
    id: 'ExecutionStatusConfirmModal.dropFilesHere',
    defaultMessage: 'Drop files here or press',
  },
  add: {
    id: 'ExecutionStatusConfirmModal.add',
    defaultMessage: 'Add',
  },
  incorrectFileSize: {
    id: 'ExecutionStatusConfirmModal.incorrectFileSize',
    defaultMessage: 'File size exceeds 128 MB',
  },
  incorrectFileFormat: {
    id: 'ExecutionStatusConfirmModal.incorrectFileFormat',
    defaultMessage: 'Unsupported format',
  },
  attachmentUploadFailed: {
    id: 'ExecutionStatusConfirmModal.attachmentUploadFailed',
    defaultMessage: 'Failed to upload attachment: {fileName}',
  },
});
