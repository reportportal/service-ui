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

export const downloadFile = (url) => {
  fetch(url, { responseType: 'blob' }, true).then((response) => {
    const data = response.data;
    const attachmentHeader = response.headers['content-disposition'];
    const fileName = /filename=(.*?)(?:\s|$)/.exec(attachmentHeader)[1];
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
