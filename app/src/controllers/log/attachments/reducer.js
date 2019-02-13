import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { loadingReducer } from 'controllers/loading';
import { ATTACHMENTS_NAMESPACE } from './constants';

export const attachmentsReducer = combineReducers({
  logsWithAttachments: fetchReducer(ATTACHMENTS_NAMESPACE, { contentPath: 'content' }),
  loading: loadingReducer(ATTACHMENTS_NAMESPACE),
});
