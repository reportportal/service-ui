import { createSelector } from 'reselect';
import { logItemsSelector } from 'controllers/log/selectors';

import { getIcon } from './utils';

export const attachmentsSelector = createSelector(logItemsSelector, (logItems) =>
  logItems
    .filter((item) => item.binary_content)
    .map((item) => item.binary_content)
    .map((attachment) => ({
      id: attachment.id,
      src: getIcon(attachment.content_type),
      alt: attachment.content_type,
      attachment,
    })),
);
