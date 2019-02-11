import { FETCH_ATTACHMENTS_ACTION, OPEN_ATTACHMENT_ACTION } from './constants';

export const fetchAttachmentsAction = () => ({
  type: FETCH_ATTACHMENTS_ACTION,
});

export const openAttachmentAction = (payload) => ({
  type: OPEN_ATTACHMENT_ACTION,
  payload,
});
