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
