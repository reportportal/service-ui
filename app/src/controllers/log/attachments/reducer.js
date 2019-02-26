import { combineReducers } from 'redux';
import { queueReducers } from 'common/utils';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { ATTACHMENTS_NAMESPACE, CLEAR_ATTACHMENTS_ACTION } from './constants';

export const logsWithAttachmentsReducer = (state = [], { type }) => {
  switch (type) {
    case CLEAR_ATTACHMENTS_ACTION:
      return [];
    default:
      return state;
  }
};

export const attachmentsReducer = combineReducers({
  logsWithAttachments: queueReducers(
    fetchReducer(ATTACHMENTS_NAMESPACE, { contentPath: 'content' }),
    logsWithAttachmentsReducer,
  ),
  loading: loadingReducer(ATTACHMENTS_NAMESPACE),
});
