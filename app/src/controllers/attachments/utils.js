import { URLS } from 'common/urls';
import { IMAGE } from 'common/constants/fileTypes';
import attachment from 'common/img/attachments/attachment.svg';
import { FILE_EXTENSIONS_MAP, FILE_MODAL_IDS_MAP } from './constants';

const getAttachmentTypeConfig = (contentType) =>
  (contentType && contentType.toLowerCase().split('/')) || '';

export const extractExtension = (contentType) => getAttachmentTypeConfig(contentType)[1] || '';

export const getFileIconSource = (item) => {
  const [fileType, extension] = getAttachmentTypeConfig(item.contentType);
  if (fileType === IMAGE) {
    return URLS.getFileById(item.id);
  }
  return FILE_EXTENSIONS_MAP[extension] || attachment;
};

export const getAttachmentModalId = (contentType) => {
  const [fileType, extension] = getAttachmentTypeConfig(contentType);
  return FILE_MODAL_IDS_MAP[fileType === IMAGE ? IMAGE : extension];
};
