import { createSelector } from 'reselect';
import { logItemsSelector } from 'controllers/log/selectors';
import { getFileIconSource } from './utils';

export const attachmentsSelector = createSelector(logItemsSelector, (logItems) =>
  logItems
    .filter((item) => item.binaryContent)
    .map((item) => item.binaryContent)
    .map((attachment) => ({
      id: attachment.id,
      src: getFileIconSource(attachment),
      alt: attachment.contentType,
      contentType: attachment.contentType,
    })),
);
