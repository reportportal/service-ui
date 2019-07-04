import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { attachmentsReducer } from 'controllers/attachments';
import { TEST_ITEM_LOG_ITEMS_NAMESPACE, TEST_ITEM_ATTACHMENTS_NAMESPACE } from './constants';

export const testItemLogReducer = combineReducers({
  logItems: fetchReducer(TEST_ITEM_LOG_ITEMS_NAMESPACE, { contentPath: 'content' }),
  pagination: paginationReducer(TEST_ITEM_LOG_ITEMS_NAMESPACE),
  loading: loadingReducer(TEST_ITEM_LOG_ITEMS_NAMESPACE),
  attachments: attachmentsReducer(TEST_ITEM_ATTACHMENTS_NAMESPACE),
});
