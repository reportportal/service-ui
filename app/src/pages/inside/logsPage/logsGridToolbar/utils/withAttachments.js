import { getStorageItem, setStorageItem } from 'common/utils';
import { DEFAULT_WITH_ATTACHMENTS, WITH_ATTACHMENTS_STORAGE_KEY } from 'controllers/log/constants';

const getWithAttachmentsFromStorage = (userId) =>
  (getStorageItem(`${userId}_settings`) || {})[WITH_ATTACHMENTS_STORAGE_KEY];

export const getWithAttachments = (userId) =>
  getWithAttachmentsFromStorage(userId) || DEFAULT_WITH_ATTACHMENTS;

export const setWithAttachments = (withAttachments, userId) => {
  const currentUserSettings = getStorageItem(`${userId}_settings`) || {};

  setStorageItem(`${userId}_settings`, {
    ...currentUserSettings,
    [WITH_ATTACHMENTS_STORAGE_KEY]: withAttachments,
  });
};
