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
  dropFileDescription: {
    id: 'createTestCaseModal.dropFileDescription',
    defaultMessage: 'Drop .JPEG, .JPG or .PNG file here or {browseButton} to attach',
  },
  browseText: {
    id: 'createTestCaseModal.browseText',
    defaultMessage: 'Browse',
  },
  fileSizeInfo: {
    id: 'createTestCaseModal.fileSizeInfo',
    defaultMessage: 'File size should be up to 128 MB',
  },
  incorrectFileFormat: {
    id: 'createTestCaseModal.incorrectFileFormat',
    defaultMessage: 'Unsupported format',
  },
  attachments: {
    id: 'createTestCaseModal.attachments',
    defaultMessage: 'Attachments',
  },
});
