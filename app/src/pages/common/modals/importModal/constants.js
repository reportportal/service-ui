import { ZIP, JAR } from 'common/constants/fileTypes';

export const MODAL_TYPE_IMPORT_LAUNCH = 'import';
export const MODAL_TYPE_UPLOAD_PLUGIN = 'upload';

export const ACCEPT_FILE_MIME_TYPES = {
  [MODAL_TYPE_IMPORT_LAUNCH]: [
    'application/zip',
    'application/x-zip-compressed',
    'application/zip-compressed',
  ],
  [MODAL_TYPE_UPLOAD_PLUGIN]: ['.jar'],
};

export const ACCEPT_FILE_TYPES_ABBR = {
  [MODAL_TYPE_IMPORT_LAUNCH]: ZIP,
  [MODAL_TYPE_UPLOAD_PLUGIN]: JAR,
};

export const MAX_FILE_SIZES = {
  [MODAL_TYPE_IMPORT_LAUNCH]: 33554432,
  [MODAL_TYPE_UPLOAD_PLUGIN]: 134217728,
};
