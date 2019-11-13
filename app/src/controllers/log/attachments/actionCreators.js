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

import {
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  OPEN_ATTACHMENT_ACTION,
  CLEAR_ATTACHMENTS_ACTION,
  FETCH_FIRST_ATTACHMENTS_ACTION,
  SET_ACTIVE_ATTACHMENT_ACTION,
} from './constants';

export const fetchAttachmentsConcatAction = (payload) => ({
  type: FETCH_ATTACHMENTS_CONCAT_ACTION,
  payload,
});

export const fetchFirstAttachmentsAction = (payload = {}) => ({
  type: FETCH_FIRST_ATTACHMENTS_ACTION,
  payload,
});

export const clearAttachmentsAction = () => ({
  type: CLEAR_ATTACHMENTS_ACTION,
});

export const openAttachmentAction = (payload) => ({
  type: OPEN_ATTACHMENT_ACTION,
  payload,
});

export const setActiveAttachmentAction = (attachmentId) => ({
  type: SET_ACTIVE_ATTACHMENT_ACTION,
  payload: attachmentId,
});
