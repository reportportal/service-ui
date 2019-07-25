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
