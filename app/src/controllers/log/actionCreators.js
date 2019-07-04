import { createClearAttachmentsAction } from 'controllers/attachments';
import {
  FETCH_LOG_PAGE_DATA,
  FETCH_HISTORY_ENTRIES,
  ATTACHMENTS_NAMESPACE,
  FETCH_LOG_ATTACHMENTS_CONCAT_ACTION,
} from './constants';

export const fetchLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
});

export const refreshLogPageData = () => ({
  type: FETCH_LOG_PAGE_DATA,
  meta: {
    refresh: true,
  },
});

export const fetchHistoryEntriesAction = () => ({
  type: FETCH_HISTORY_ENTRIES,
});

export const fetchLogAttachmentsConcatAction = (payload) => ({
  type: FETCH_LOG_ATTACHMENTS_CONCAT_ACTION,
  payload,
});

export const clearLogAttachmentsAction = createClearAttachmentsAction(ATTACHMENTS_NAMESPACE);
