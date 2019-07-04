import {
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  OPEN_ATTACHMENT_ACTION,
  CLEAR_ATTACHMENTS_ACTION,
} from './constants';

export const fetchAttachmentsConcatAction = (namespace) => (url) => (payload) => ({
  type: FETCH_ATTACHMENTS_CONCAT_ACTION,
  payload: {
    url,
    ...payload,
  },
  meta: {
    namespace,
  },
});

export const createClearAttachmentsAction = (namespace) => () => ({
  type: CLEAR_ATTACHMENTS_ACTION,
  meta: {
    namespace,
  },
});

export const openAttachmentAction = (payload) => ({
  type: OPEN_ATTACHMENT_ACTION,
  payload,
});
