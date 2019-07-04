import { combineReducers } from 'redux';
import { queueReducers } from 'common/utils';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { CLEAR_ATTACHMENTS_ACTION } from './constants';

export const logsWithAttachmentsReducer = (namespace) => (state = [], { type, meta }) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case CLEAR_ATTACHMENTS_ACTION:
      return [];
    default:
      return state;
  }
};

export const attachmentsPaginationReducer = (namespace) => (state = {}, { type, meta }) => {
  if (meta && meta.namespace && meta.namespace !== namespace) {
    return state;
  }
  switch (type) {
    case CLEAR_ATTACHMENTS_ACTION:
      return {};
    default:
      return state;
  }
};

export const attachmentsReducer = (namespace) =>
  combineReducers({
    logsWithAttachments: queueReducers(
      fetchReducer(namespace, { contentPath: 'content' }),
      logsWithAttachmentsReducer(namespace),
    ),
    pagination: queueReducers(
      paginationReducer(namespace),
      attachmentsPaginationReducer(namespace),
    ),
    loading: loadingReducer(namespace),
  });
