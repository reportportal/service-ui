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

// Splits a header value on `;` outside of quoted strings (a quoted value may contain `;`).
const splitParameters = (header) => {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < header.length; i += 1) {
    const char = header[i];
    if (inQuotes && char === '\\' && i + 1 < header.length) {
      current += char + header[i + 1];
      i += 1;
    } else {
      if (char === '"') {
        inQuotes = !inQuotes;
      }
      if (char === ';' && !inQuotes) {
        parts.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  parts.push(current);
  return parts;
};

const parseParameters = (header) =>
  splitParameters(header).reduce((params, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) {
      return params;
    }
    const name = part.slice(0, separatorIndex).trim().toLowerCase();
    const value = part.slice(separatorIndex + 1).trim();
    if (name && !(name in params)) {
      params[name] = value;
    }
    return params;
  }, {});

const unquote = (value) =>
  value.length >= 2 && value.startsWith('"') && value.endsWith('"')
    ? value.slice(1, -1).replace(/\\(.)/g, '$1')
    : value;

// Reads the file name from a Content-Disposition header. Parameter names are matched as a whole
// (so `x-filename` is not `filename`), case-insensitively. Prefers the RFC 5987 `filename*`
// parameter (`charset'language'percent-encoded`) and falls back to the plain `filename`.
export const getFileNameFromContentDisposition = (header, fileNameFallback = '') => {
  if (!header) {
    return fileNameFallback;
  }
  const params = parseParameters(header);
  const encoded = params['filename*'];
  if (encoded) {
    const match = /^(?:[^']*)'[^']*'(.*)$/.exec(unquote(encoded));
    try {
      const decoded = decodeURIComponent((match ? match[1] : unquote(encoded)).trim());
      if (decoded) {
        return decoded;
      }
    } catch {
      // malformed encoding: fall through to the plain parameter
    }
  }
  const fileName = params.filename ? unquote(params.filename).trim() : '';
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
