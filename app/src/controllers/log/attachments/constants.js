import xml from 'common/img/attachments/xml.svg';
import php from 'common/img/attachments/php.svg';
import json from 'common/img/attachments/json.svg';
import js from 'common/img/attachments/js.svg';
import har from 'common/img/attachments/har.svg';
import css from 'common/img/attachments/css.svg';
import csv from 'common/img/attachments/csv.svg';
import html from 'common/img/attachments/html.svg';
import txt from 'common/img/attachments/txt.svg';
import archive from 'common/img/attachments/archive.svg';
import * as FILE_TYPES from 'common/constants/fileTypes';

export const ATTACHMENTS_NAMESPACE = 'log/attachments';
export const FETCH_ATTACHMENTS_CONCAT_ACTION = 'fetchAttachmentsConcatAction';
export const CLEAR_ATTACHMENTS_ACTION = 'clearAttachmentsAction';
export const OPEN_ATTACHMENT_ACTION = 'openAttachmentAction';
export const ATTACHMENT_IMAGE_MODAL_ID = 'attachmentImageModal';
export const ATTACHMENT_HAR_FILE_MODAL_ID = 'attachmentHarFileModal';
export const ATTACHMENT_CODE_MODAL_ID = 'attachmentCodeModal';

export const FILE_PREVIEWS_MAP = {
  [FILE_TYPES.XML]: xml,
  [FILE_TYPES.JAVASCRIPT]: js,
  [FILE_TYPES.JSON]: json,
  [FILE_TYPES.CSS]: css,
  [FILE_TYPES.PHP]: php,
  [FILE_TYPES.HAR]: har,
  [FILE_TYPES.TXT]: txt,
  [FILE_TYPES.PLAIN]: txt,
  [FILE_TYPES.HTML]: html,
  [FILE_TYPES.CSV]: csv,
  [FILE_TYPES.ZIP]: archive,
  [FILE_TYPES.RAR]: archive,
  [FILE_TYPES.TGZ]: archive,
  [FILE_TYPES.TAZ]: archive,
  [FILE_TYPES.TAR]: archive,
  [FILE_TYPES.GZIP]: archive,
};

export const FILE_PATTERNS_MAP = {
  [FILE_TYPES.RAR]: /\brar\b/i,
  [FILE_TYPES.HAR]: /\bhar\b/i,
  [FILE_TYPES.PHP]: /\bphp\b/i,
};

export const FILE_MODAL_IDS_MAP = {
  [FILE_TYPES.XML]: ATTACHMENT_CODE_MODAL_ID,
  [FILE_TYPES.JAVASCRIPT]: ATTACHMENT_CODE_MODAL_ID,
  [FILE_TYPES.JSON]: ATTACHMENT_CODE_MODAL_ID,
  [FILE_TYPES.CSS]: ATTACHMENT_CODE_MODAL_ID,
  [FILE_TYPES.PHP]: ATTACHMENT_CODE_MODAL_ID,
  [FILE_TYPES.HAR]: ATTACHMENT_HAR_FILE_MODAL_ID,
  [FILE_TYPES.IMAGE]: ATTACHMENT_IMAGE_MODAL_ID,
};
