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

import { combineReducers } from 'redux';
import { queueReducers } from 'common/utils';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import {
  ATTACHMENTS_NAMESPACE,
  CLEAR_ATTACHMENTS_ACTION,
  SET_ACTIVE_ATTACHMENT_ACTION,
} from './constants';

export const logsWithAttachmentsReducer = (state = [], { type }) => {
  switch (type) {
    case CLEAR_ATTACHMENTS_ACTION:
      return [];
    default:
      return state;
  }
};

export const attachmentsPaginationReducer = (state = {}, { type }) => {
  switch (type) {
    case CLEAR_ATTACHMENTS_ACTION:
      return {};
    default:
      return state;
  }
};

export const activeAttachmentReducer = (state = null, { type, payload }) => {
  switch (type) {
    case SET_ACTIVE_ATTACHMENT_ACTION:
      return payload;
    default:
      return state;
  }
};

export const attachmentsReducer = combineReducers({
  logsWithAttachments: queueReducers(
    fetchReducer(ATTACHMENTS_NAMESPACE, { contentPath: 'content' }),
    logsWithAttachmentsReducer,
  ),
  pagination: queueReducers(paginationReducer(ATTACHMENTS_NAMESPACE), attachmentsPaginationReducer),
  loading: loadingReducer(ATTACHMENTS_NAMESPACE),
  activeAttachmentId: activeAttachmentReducer,
});
