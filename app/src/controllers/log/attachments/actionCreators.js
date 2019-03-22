import {
  FETCH_ATTACHMENTS_CONCAT_ACTION,
  OPEN_ATTACHMENT_ACTION,
  CLEAR_ATTACHMENTS_ACTION,
} from './constants';

export const fetchAttachmentsConcatAction = (payload) => ({
  type: FETCH_ATTACHMENTS_CONCAT_ACTION,
  payload,
});

export const clearAttachmentsAction = () => ({
  type: CLEAR_ATTACHMENTS_ACTION,
});

export const openAttachmentAction = (payload) => ({
  type: OPEN_ATTACHMENT_ACTION,
  payload,
});
