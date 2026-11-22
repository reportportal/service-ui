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

import { extension as getExtension } from 'mime-types';
import { URLS } from 'common/urls';
import { IMAGE, PLAIN, TXT } from 'common/constants/fileTypes';
import attachment from 'common/img/attachments/attachment.svg';
import {
  FILE_PREVIEWS_MAP,
  FILE_MODAL_IDS_MAP,
  FILE_PATTERNS_MAP,
  FILE_ACTIONS_MAP,
  ALL_ALLOWED,
  MIME_TYPE_TO_EXTENSION_MAP,
} from './constants';

const getAttachmentTypeConfig = (contentType) => contentType?.toLowerCase().split('/') || '';

export const extractExtension = (contentType) => {
  const attachmentTypeConfig = getAttachmentTypeConfig(contentType);

  return (
    getExtension(contentType) ||
    MIME_TYPE_TO_EXTENSION_MAP[contentType] ||
    attachmentTypeConfig[1] ||
    attachmentTypeConfig[0] ||
    ''
  );
};

export const isTextWithJson = (contentType) => {
  const attachmentTypeConfig = getAttachmentTypeConfig(contentType);
  return attachmentTypeConfig[0] === 'text';
};

export const getExtensionFromPattern = (extensionString) =>
  Object.keys(FILE_PATTERNS_MAP).find((key) => !!FILE_PATTERNS_MAP[key].exec(extensionString));

export const getFileIconSource = (item, projectKey, loadThumbnail) => {
  const [fileType, extension] = getAttachmentTypeConfig(item.contentType);
  if (fileType === IMAGE) {
    return URLS.getFileById(projectKey, item.id, loadThumbnail);
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

export const createAttachment = (item, projectKey) => {
  const isImage = getAttachmentTypeConfig(item.contentType)[0] === IMAGE;

  return {
    id: item.id,
    src: getFileIconSource(item, projectKey),
    thumbnailSrc: isImage ? URLS.getFileById(projectKey, item.id, true) : null,
    alt: item.contentType,
    contentType: item.contentType,
    fileName: item.fileName,
    isImage,
  };
};

export const createAttachmentName = (id, contentType) => {
  const extension = extractExtension(contentType);

  return `attachment_${id}.${extension === PLAIN ? TXT : extension}`;
};

export const isFileActionAllowed = (contentType, action) => {
  const allowedFileTypes = FILE_ACTIONS_MAP[action] || [];

  if (allowedFileTypes === ALL_ALLOWED) {
    return true;
  }

  const [fileType] = getAttachmentTypeConfig(contentType);

  if (fileType === IMAGE) {
    return allowedFileTypes.includes(IMAGE);
  }

  const extension = extractExtension(contentType);
  const extensionFromPattern = getExtensionFromPattern(extension);

  return !!allowedFileTypes.some((type) => type === extension || type === extensionFromPattern);
};

// Mirrors the server's inline-safe list: anything else is opened as plain text so an attachment
// can never become a document (HTML, SVG, XML) running in the application origin.
const INLINE_SAFE_CONTENT_TYPE =
  /^(?:image\/(?!svg)[\w.+-]+|video\/[\w.+-]+|audio\/[\w.+-]+|application\/pdf|text\/plain)$/i;

const CHARSET_PARAMETER_RE = /;\s*charset\s*=\s*"?([\w.:-]+)"?\s*(?:;|$)/i;

// Only the MIME essence decides what is safe; for text a well-formed charset is kept, because the
// bytes are not transcoded and dropping it would make the browser guess the encoding.
export const getInlineSafeContentType = (contentType) => {
  const mimeType = (contentType || '').split(';')[0].trim();
  if (!INLINE_SAFE_CONTENT_TYPE.test(mimeType)) {
    return 'text/plain';
  }
  const charset = mimeType.toLowerCase() === 'text/plain' && CHARSET_PARAMETER_RE.exec(contentType);
  return charset ? `${mimeType};charset=${charset[1]}` : mimeType;
};
