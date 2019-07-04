import { URLS } from 'common/urls';
import { IMAGE } from 'common/constants/fileTypes';
import attachment from 'common/img/attachments/attachment.svg';
import { FILE_PREVIEWS_MAP, FILE_MODAL_IDS_MAP, FILE_PATTERNS_MAP } from './constants';

const getAttachmentTypeConfig = (contentType) =>
  (contentType && contentType.toLowerCase().split('/')) || '';

export const extractExtension = (contentType) => {
  const attachmentTypeConfig = getAttachmentTypeConfig(contentType);
  return attachmentTypeConfig[1] || attachmentTypeConfig[0] || '';
};

export const getExtensionFromPattern = (extensionString) =>
  Object.keys(FILE_PATTERNS_MAP).find((key) => !!FILE_PATTERNS_MAP[key].exec(extensionString));

export const getFileIconSource = (item) => {
  const [fileType, extension] = getAttachmentTypeConfig(item.contentType);
  if (fileType === IMAGE) {
    return URLS.getFileById(item.id);
  }
  const extensionFromPattern = getExtensionFromPattern(extension || fileType);
  return (
    FILE_PREVIEWS_MAP[extension || fileType] ||
    FILE_PREVIEWS_MAP[extensionFromPattern] ||
    attachment
  );
};

export const getAttachmentModalId = (contentType) => {
  const [fileType, extension] = getAttachmentTypeConfig(contentType);
  const extensionFromPattern = getExtensionFromPattern(extension || fileType);
  return (
    FILE_MODAL_IDS_MAP[fileType === IMAGE ? IMAGE : extension || fileType] ||
    FILE_MODAL_IDS_MAP[extensionFromPattern]
  );
};

export const createAttachment = (item) => ({
  id: item.id,
  src: getFileIconSource(item),
  alt: item.contentType,
  contentType: item.contentType,
  isImage: getAttachmentTypeConfig(item.contentType)[0] === IMAGE,
});
