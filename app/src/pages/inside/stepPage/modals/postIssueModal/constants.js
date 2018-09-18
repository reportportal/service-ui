export const INCLUDE_LOGS_KEY = 'includeLogs';
export const INCLUDE_ATTACHMENTS_KEY = 'includeData';
export const INCLUDE_COMMENTS_KEY = 'includeComments';
export const LOG_QUANTITY = 50;
export const DEFAULT_INCLUDE_DATA_CONFIG = {
  [INCLUDE_ATTACHMENTS_KEY]: true,
  [INCLUDE_LOGS_KEY]: true,
  [INCLUDE_COMMENTS_KEY]: true,
};

export const BULK_INCLUDE_DATA_CONFIG = {
  [INCLUDE_ATTACHMENTS_KEY]: false,
  [INCLUDE_LOGS_KEY]: false,
  [INCLUDE_COMMENTS_KEY]: false,
};
