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

export {
  openAttachmentAction,
  fetchAttachmentsConcatAction,
  clearAttachmentsAction,
  fetchFirstAttachmentsAction,
  setActiveAttachmentAction,
} from './actionCreators';
export {
  FILE_PREVIEWS_MAP,
  FILE_MODAL_IDS_MAP,
  ATTACHMENT_CODE_MODAL_ID,
  ATTACHMENT_HAR_FILE_MODAL_ID,
  ATTACHMENT_IMAGE_MODAL_ID,
  ATTACHMENTS_NAMESPACE,
} from './constants';
export { getFileIconSource, getAttachmentModalId, extractExtension } from './utils';
export {
  attachmentItemsSelector,
  attachmentsLoadingSelector,
  logsWithAttachmentsSelector,
  attachmentsPaginationSelector,
  activeAttachmentIdSelector,
} from './selectors';
export { attachmentsReducer } from './reducer';
export { attachmentSagas } from './sagas';
