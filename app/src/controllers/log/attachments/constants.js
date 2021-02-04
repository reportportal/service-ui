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

export const ALL_ALLOWED = '*';
export const ATTACHMENTS_NAMESPACE = 'log/attachments';
export const FETCH_ATTACHMENTS_CONCAT_ACTION = 'fetchAttachmentsConcatAction';
export const CLEAR_ATTACHMENTS_ACTION = 'clearAttachmentsAction';
export const ATTACHMENT_HAR_FILE_MODAL_ID = 'attachmentHarFileModal';
export const ATTACHMENT_CODE_MODAL_ID = 'attachmentCodeModal';
export const ATTACHMENT_IMAGE_MODAL_ID = 'attachmentImageModal';
export const FETCH_FIRST_ATTACHMENTS_ACTION = 'fetchFirstAttachments';
export const SET_ACTIVE_ATTACHMENT_ACTION = 'setActiveAttachment';

export const DOWNLOAD_ATTACHMENT_ACTION = 'downloadAttachmentAction';
export const OPEN_ATTACHMENT_IN_MODAL_ACTION = 'openAttachmentInModalAction';
export const OPEN_ATTACHMENT_IN_BROWSER_ACTION = 'openAttachmentInBrowserAction';

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

export const FILE_ACTIONS_MAP = {
  [DOWNLOAD_ATTACHMENT_ACTION]: ALL_ALLOWED,
  [OPEN_ATTACHMENT_IN_BROWSER_ACTION]: [
    FILE_TYPES.XML,
    FILE_TYPES.JAVASCRIPT,
    FILE_TYPES.JSON,
    FILE_TYPES.CSS,
    FILE_TYPES.PHP,
    FILE_TYPES.HAR,
    FILE_TYPES.TXT,
    FILE_TYPES.PLAIN,
    FILE_TYPES.HTML,
    FILE_TYPES.CSV,
    FILE_TYPES.PDF,
    FILE_TYPES.IMAGE,
  ],
  [OPEN_ATTACHMENT_IN_MODAL_ACTION]: [
    FILE_TYPES.XML,
    FILE_TYPES.JAVASCRIPT,
    FILE_TYPES.JSON,
    FILE_TYPES.CSS,
    FILE_TYPES.PHP,
    FILE_TYPES.HAR,
    FILE_TYPES.IMAGE,
  ],
};

export const DEFAULT_PAGE_SIZE = 6;
export const DEFAULT_LOADED_PAGES = 2;
