import { createSelector } from 'reselect';
import { createAttachment } from './utils';

export const createLogsWithAttachmentsSelector = (attachmentsSelector) => (state) =>
  attachmentsSelector(state).logsWithAttachments || [];

export const createAttachmentsLoadingSelector = (attachmentsSelector) => (state) =>
  attachmentsSelector(state).loading || false;

export const createAttachmentsPaginationSelector = (attachmentsSelector) => (state) =>
  attachmentsSelector(state).pagination || {};

export const createAttachmentItemsSelector = (attachmentsSelector) =>
  createSelector(createLogsWithAttachmentsSelector(attachmentsSelector), (logItems) =>
    logItems.map((item) => item.binaryContent).map((attachment) => createAttachment(attachment)),
  );
