import { UAT_API_URL_PREFIX } from 'common/urls';

export const normalizePathWithPrefix = (path) => {
  if (path.indexOf(UAT_API_URL_PREFIX) === -1) {
    return `${UAT_API_URL_PREFIX}${path}`;
  }
  return path;
};

export const setWindowLocationToNewPath = (path) => {
  window.location = `${window.location.protocol}//${window.location.host}${path}`;
};
