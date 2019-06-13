import { getStorageItem, updateStorageItem } from 'common/utils';
import { DEFAULT_PAGE_SIZE, MIN_PAGE_SIZE, MAX_PAGE_SIZE } from './constants';

const getPageUserSettingsFromStorage = (userId) => getStorageItem(`${userId}_settings`) || {};

const updatePageUserSettingsInStorage = (userId, data) =>
  updateStorageItem(`${userId}_settings`, data);

const normalizePageSize = (size) => {
  if (size < MIN_PAGE_SIZE) {
    return MIN_PAGE_SIZE;
  } else if (size > MAX_PAGE_SIZE) {
    return MAX_PAGE_SIZE;
  }
  return size;
};

export const getPageSize = (userId, storageKey) =>
  getPageUserSettingsFromStorage(userId)[storageKey] || DEFAULT_PAGE_SIZE;

export const setPageSize = (userId, pageSize, storageKey) =>
  updatePageUserSettingsInStorage(userId, {
    [storageKey]: normalizePageSize(pageSize),
  });

export const getStorageKey = (namespace = '') =>
  namespace.indexOf('item') === 0 ? 'testPageCount' : `${namespace}PageCount`;
