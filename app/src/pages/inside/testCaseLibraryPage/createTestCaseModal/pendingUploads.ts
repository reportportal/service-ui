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

// Attachments are uploaded as soon as a file is added to the form, before the test case is saved.
// Ids uploaded in the current modal session are tracked here so that uploads the user removes, or
// that are still unsaved when the modal is cancelled, can be deleted (best effort) instead of being
// left orphaned in storage.
export interface PendingUploads {
  track: (attachmentId: string) => void;
  isTracked: (attachmentId: string) => boolean;
  discard: (attachmentId: string) => void;
  discardAll: () => void;
  // The save request was sent: the uploads may be linked to the test case now, stop tracking them.
  release: () => void;
}

export const createPendingUploads = (
  deleteAttachment: (attachmentId: string) => void,
): PendingUploads => {
  const attachmentIds = new Set<string>();
  let isDiscarded = false;

  return {
    track: (attachmentId) => {
      // An upload that finishes after the modal was cancelled is deleted right away.
      if (isDiscarded) {
        deleteAttachment(attachmentId);
      } else {
        attachmentIds.add(attachmentId);
      }
    },
    isTracked: (attachmentId) => attachmentIds.has(attachmentId),
    discard: (attachmentId) => {
      if (attachmentIds.delete(attachmentId)) {
        deleteAttachment(attachmentId);
      }
    },
    discardAll: () => {
      isDiscarded = true;
      attachmentIds.forEach((attachmentId) => deleteAttachment(attachmentId));
      attachmentIds.clear();
    },
    release: () => attachmentIds.clear(),
  };
};
