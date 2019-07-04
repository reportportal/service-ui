import { createClearAttachmentsAction } from 'controllers/attachments';
import {
  FETCH_TEST_ITEM_LOG_DATA,
  TEST_ITEM_ATTACHMENTS_NAMESPACE,
  FETCH_TEST_ITEM_ATTACHMENTS,
} from './constants';

export const fetchTestItemLogDataAction = () => ({
  type: FETCH_TEST_ITEM_LOG_DATA,
});

export const clearTestItemAttachmentsAction = createClearAttachmentsAction(
  TEST_ITEM_ATTACHMENTS_NAMESPACE,
);

export const fetchTestItemAttachmentsAction = () => ({
  type: FETCH_TEST_ITEM_ATTACHMENTS,
});
