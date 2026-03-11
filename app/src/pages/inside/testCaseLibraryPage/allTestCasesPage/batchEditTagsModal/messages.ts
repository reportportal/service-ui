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
  batchEditTagsModalTitle: {
    id: 'BatchEditTagsModal.title',
    defaultMessage: 'Edit Tags',
  },
  batchEditTagsModalDescription: {
    id: 'BatchEditTagsModal.description',
    defaultMessage:
      'You are about to edit similar tags for <b>{count}</b> selected test {count, plural, one {case} other {cases}}',
  },
  batchEditTagsModalNoTags: {
    id: 'batchEditTagsModal.noTags',
    defaultMessage: 'No similar tags added yet',
  },
  batchEditTagsModalSimilarTags: {
    id: 'batchEditTagsModal.similarTags',
    defaultMessage: 'Similar tags',
  },
  batchEditTagsModalAddButton: {
    id: 'batchEditTagsModal.addButton',
    defaultMessage: 'Add New Tag',
  },
});
