import { PAGE_KEY, SIZE_KEY } from './constants';
import { getPageSize, getStorageKey } from './storageUtils';

export const checkPageSize = (query, uid, namespace) => {
  if (!query[SIZE_KEY]) {
    // eslint-disable-next-line no-param-reassign
    query[PAGE_KEY] = 1;
    // eslint-disable-next-line no-param-reassign
    query[SIZE_KEY] = getPageSize(uid, getStorageKey(namespace));
  }
};
