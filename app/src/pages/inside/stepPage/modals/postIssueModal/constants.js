export const INCLUDE_LOGS_KEY = 'includeLogs';
export const INCLUDE_ATTACHMENTS_KEY = 'includeAttachments';
export const INCLUDE_COMMENT_KEY = 'includeComment';
export const LOG_QUANTITY = 50;
export const SAVED_BTS_CREDENTIALS_KEY = 'btsCredentials';

export const DEFAULT_INCLUDE_DATA_CONFIG = {
  [INCLUDE_ATTACHMENTS_KEY]: true,
  [INCLUDE_LOGS_KEY]: true,
  [INCLUDE_COMMENT_KEY]: true,
};

export const BULK_INCLUDE_DATA_CONFIG = {
  [INCLUDE_ATTACHMENTS_KEY]: false,
  [INCLUDE_LOGS_KEY]: false,
  [INCLUDE_COMMENT_KEY]: false,
};
