import { createSelector } from 'reselect';
import { attachmentsSelector } from 'controllers/log/selectors';
import { getFileIconSource } from './utils';

export const logsWithAttachmentsSelector = (state) =>
  attachmentsSelector(state).logsWithAttachments || [];

export const attachmentsLoadingSelector = (state) => attachmentsSelector(state).loading || false;

export const attachmentsPaginationSelector = (state) => attachmentsSelector(state).pagination || {};

export const attachmentItemsSelector = createSelector(logsWithAttachmentsSelector, (logItems) =>
  logItems.map((item) => item.binaryContent).map((attachment) => ({
    id: attachment.id,
    src: getFileIconSource(attachment),
    alt: attachment.contentType,
    contentType: attachment.contentType,
  })),
);
