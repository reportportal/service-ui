/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

export const isTextWithJson = (contentType) => {
  const attachmentTypeConfig = getAttachmentTypeConfig(contentType);
  return attachmentTypeConfig[0] === 'text';
};

export const getExtensionFromPattern = (extensionString) =>
  Object.keys(FILE_PATTERNS_MAP).find((key) => !!FILE_PATTERNS_MAP[key].exec(extensionString));

export const getFileIconSource = (item, projectId, loadThumbnail) => {
  const [fileType, extension] = getAttachmentTypeConfig(item.contentType);
  if (fileType === IMAGE) {
    return URLS.getFileById(projectId, item.id, loadThumbnail);
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

export const createAttachment = (item, projectId) => {
  const isImage = getAttachmentTypeConfig(item.contentType)[0] === IMAGE;

  return {
    id: item.id,
    src: getFileIconSource(item, projectId),
    thumbnailSrc: isImage ? URLS.getFileById(projectId, item.id, true) : null,
    alt: item.contentType,
    contentType: item.contentType,
    isImage,
  };
};
