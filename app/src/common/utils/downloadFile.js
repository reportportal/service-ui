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

import { fetch } from 'common/utils/fetch';

// Reads the file name from a Content-Disposition header. Prefers the RFC 5987 `filename*` parameter
// (percent-encoded UTF-8) and falls back to the plain `filename`, quoted or not, wherever it stands.
export const getFileNameFromContentDisposition = (header, fileNameFallback = '') => {
  if (!header) {
    return fileNameFallback;
  }
  const encoded = /filename\*\s*=\s*(?:UTF-8'[^']*')?([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // malformed encoding: fall through to the plain parameter
    }
  }
  const plain = /filename\s*=\s*(?:"([^"]*)"|([^;]+))/i.exec(header);
  const fileName = plain ? (plain[1] ?? plain[2]).trim() : '';
  return fileName || fileNameFallback;
};

export const downloadFile = (url, requestParams = {}, fileNameFallback = '') => {
  return fetch(
    url,
    {
      responseType: 'blob',
      ...requestParams,
    },
    true,
  ).then((response) => {
    const data = response.data;
    const attachmentHeader = response.headers['content-disposition'];
    const fileName = getFileNameFromContentDisposition(attachmentHeader, fileNameFallback);
    const objectURL = URL.createObjectURL(data);
    if ('msSaveOrOpenBlob' in navigator) {
      navigator.msSaveOrOpenBlob(data, fileName);
    } else if ('download' in HTMLAnchorElement.prototype) {
      const link = document.createElement('a');
      link.setAttribute('href', objectURL);
      link.setAttribute('download', fileName);
      link.dispatchEvent(new MouseEvent('click'));
    } else {
      window.open(objectURL);
    }
    URL.revokeObjectURL(objectURL);
  });
};
