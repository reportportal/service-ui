import {
  createAttachmentsLoadingSelector,
  createAttachmentItemsSelector,
  createAttachmentsPaginationSelector,
} from 'controllers/attachments';
import { testItemIdsArraySelector, createQueryParametersSelector } from 'controllers/pages';
import {
  TEST_ITEM_LOG,
  LAUNCH_LOG,
  NAMESPACE,
  DEFAULT_PAGINATION,
  DEFAULT_SORTING,
  DEFAULT_LOG_LEVEL,
} from './constants';
import { testItemDomainSelector } from './../selectors';

const logSelector = (state) => testItemDomainSelector(state).log || {};

export const testItemLogItemsSelector = (state) => logSelector(state).logItems || [];
export const testItemLogPaginationSelector = (state) => logSelector(state).pagination;
export const testItemLogLoadingSelector = (state) => logSelector(state).loading || false;
export const testItemLogLevelSelector = (state) => logSelector(state).level || DEFAULT_LOG_LEVEL;

export const testItemAttachmentsSelector = (state) => logSelector(state).attachments || {};

export const testItemTypeSelector = (state) =>
  testItemIdsArraySelector(state).length > 1 ? TEST_ITEM_LOG : LAUNCH_LOG;

export const testItemAttachmentsLoadingSelector = createAttachmentsLoadingSelector(
  testItemAttachmentsSelector,
);

export const testItemAttachmentItemsSelector = createAttachmentItemsSelector(
  testItemAttachmentsSelector,
);

export const testItemAttachmentsPaginationSelector = createAttachmentsPaginationSelector(
  testItemAttachmentsSelector,
);

export const querySelector = createQueryParametersSelector({
  namespace: NAMESPACE,
  defaultPagination: DEFAULT_PAGINATION,
  defaultSorting: DEFAULT_SORTING,
});
