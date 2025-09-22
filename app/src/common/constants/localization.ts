/*
 * Copyright 2025 EPAM Systems
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

import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';

export const intlMessageType = PropTypes.shape({
  defaultMessage: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
});

export const COMMON_LOCALE_KEYS = defineMessages({
  DELETE: {
    id: 'Common.delete',
    defaultMessage: 'Delete',
  },
  CANCEL: {
    id: 'Common.cancel',
    defaultMessage: 'Cancel',
  },
  APPLY: {
    id: 'Common.apply',
    defaultMessage: 'Apply',
  },
  RENAME: {
    id: 'Common.rename',
    defaultMessage: 'Rename',
  },
  CLOSE: {
    id: 'Common.close',
    defaultMessage: 'Close',
  },
  COPY_TO_CLIPBOARD: {
    id: 'Common.copyToClipboard',
    defaultMessage: 'Copy to Clipboard',
  },
  UPDATE: {
    id: 'Common.update',
    defaultMessage: 'Update',
  },
  SAVE: {
    id: 'Common.save',
    defaultMessage: 'Save',
  },
  CONFIRM: {
    id: 'Common.confirm',
    defaultMessage: 'Confirm',
  },
  GENERATE: {
    id: 'Common.generate',
    defaultMessage: 'Generate',
  },
  SEND: {
    id: 'Common.send',
    defaultMessage: 'Send',
  },
  FINISH: {
    id: 'Common.finish',
    defaultMessage: 'Finish',
  },
  MOVE: {
    id: 'Common.move',
    defaultMessage: 'Move',
  },
  SUBMIT: {
    id: 'Common.submit',
    defaultMessage: 'Submit',
  },
  MERGE: {
    id: 'Common.merge',
    defaultMessage: 'Merge',
  },
  INVITE: {
    id: 'Common.invite',
    defaultMessage: 'Invite',
  },
  OK: {
    id: 'Common.ok',
    defaultMessage: 'Ok',
  },
  AND: {
    id: 'Common.and',
    defaultMessage: 'And',
  },
  OR: {
    id: 'Common.or',
    defaultMessage: 'Or',
  },
  DISABLE: {
    id: 'Common.disable',
    defaultMessage: 'Disable',
  },
  ENABLE: {
    id: 'Common.enable',
    defaultMessage: 'Enable',
  },
  CLOSE_MODAL_WARNING: {
    id: 'Common.closeModalWarning',
    defaultMessage: 'You have to save changes or cancel them before closing the window',
  },
  DISCARD: {
    id: 'Common.discard',
    defaultMessage: 'Discard',
  },
  EDIT: {
    id: 'Common.edit',
    defaultMessage: 'Edit',
  },
  CLONE: {
    id: 'Common.clone',
    defaultMessage: 'Clone',
  },
  COMPARE: {
    id: 'Common.compare',
    defaultMessage: 'Compare',
  },
  ADD: {
    id: 'Common.add',
    defaultMessage: 'Add',
  },
  NO_RESULTS: {
    id: 'Common.noResults',
    defaultMessage: 'No results found',
  },
  RESET: {
    id: 'Common.reset',
    defaultMessage: 'Reset',
  },
  SEARCH: {
    id: 'Common.search',
    defaultMessage: 'Search',
  },
  UNINSTALL: {
    id: 'Common.uninstall',
    defaultMessage: 'Uninstall',
  },
  LOGIN: {
    id: 'Common.login',
    defaultMessage: 'Login',
  },
  MOVE_TO_DEBUG: {
    id: 'Common.moveToDebug',
    defaultMessage: 'Move to debug',
  },
  MOVE_TO_ALL_LAUNCHES: {
    id: 'Common.moveToAllLaunches',
    defaultMessage: 'Move to all launches',
  },
  FORCE_FINISH: {
    id: 'Common.forceFinish',
    defaultMessage: 'Force finish',
  },
  ERROR: {
    id: 'Common.error',
    defaultMessage: 'Error',
  },
  BACK: {
    id: 'Common.back',
    defaultMessage: 'Back',
  },
  ACTIONS: {
    id: 'Common.actions',
    defaultMessage: 'Actions',
  },
  EDIT_ITEMS: {
    id: 'Common.editItems',
    defaultMessage: 'Edit items',
  },
  PROCEED_VALID_ITEMS: {
    id: 'Common.proceedValidItems',
    defaultMessage: 'Proceed Valid Items',
  },
  DOWNLOAD: {
    id: 'Common.download',
    defaultMessage: 'Download',
  },
  OPEN_IN_NEW_TAB: {
    id: 'Common.openInNewTab',
    defaultMessage: 'Open in new tab',
  },
  ANALYZER_DISABLED: {
    id: 'Common.analyzerDisabled',
    defaultMessage: 'Service analyzer is not running',
  },
  changesWarning: {
    id: 'Common.changesWarning',
    defaultMessage: 'Field is invalid or changes were not saved',
  },
  processData: {
    id: 'Common.processData',
    defaultMessage: 'Please wait, we process your data',
  },
  documentation: {
    id: 'Common.documentation',
    defaultMessage: 'Documentation',
  },
  warning: {
    id: 'Common.warning',
    defaultMessage: 'Warning',
  },
  CREATE: {
    id: 'Common.create',
    defaultMessage: 'Create',
  },
  january: {
    id: 'Common.january',
    defaultMessage: 'January',
  },
  february: {
    id: 'Common.february',
    defaultMessage: 'February',
  },
  march: {
    id: 'Common.march',
    defaultMessage: 'March',
  },
  april: {
    id: 'Common.april',
    defaultMessage: 'April',
  },
  may: {
    id: 'Common.may',
    defaultMessage: 'May',
  },
  june: {
    id: 'Common.june',
    defaultMessage: 'June',
  },
  july: {
    id: 'Common.july',
    defaultMessage: 'July',
  },
  august: {
    id: 'Common.august',
    defaultMessage: 'August',
  },
  september: {
    id: 'Common.september',
    defaultMessage: 'September',
  },
  october: {
    id: 'Common.october',
    defaultMessage: 'October',
  },
  november: {
    id: 'Common.november',
    defaultMessage: 'November',
  },
  december: {
    id: 'Common.december',
    defaultMessage: 'December',
  },
  today: {
    id: 'Common.today',
    defaultMessage: 'Today',
  },
  yesterday: {
    id: 'Common.yesterday',
    defaultMessage: 'Yesterday',
  },
  monday: {
    id: 'Common.monday',
    defaultMessage: 'Monday',
  },
  tuesday: {
    id: 'Common.tuesday',
    defaultMessage: 'Tuesday',
  },
  wednesday: {
    id: 'Common.wednesday',
    defaultMessage: 'Wednesday',
  },
  thursday: {
    id: 'Common.thursday',
    defaultMessage: 'Thursday',
  },
  friday: {
    id: 'Common.friday',
    defaultMessage: 'Friday',
  },
  saturday: {
    id: 'Common.saturday',
    defaultMessage: 'Saturday',
  },
  sunday: {
    id: 'Common.sunday',
    defaultMessage: 'Sunday',
  },
  KEY: {
    id: 'Common.key',
    defaultMessage: 'Key',
  },
  VALUE: {
    id: 'Common.value',
    defaultMessage: 'Value',
  },
  ASSIGN: {
    id: 'Common.assign',
    defaultMessage: 'Assign',
  },
  UNASSIGN: {
    id: 'Common.unassign',
    defaultMessage: 'Unassign',
  },
  NO: {
    id: 'Common.no',
    defaultMessage: 'No',
  },
  EXPORT: {
    id: 'Common.export',
    defaultMessage: 'Export',
  },
  VALIDATION_TOOLTIP: {
    id: 'Common.validationTooltip',
    defaultMessage:
      'Please ensure all required fields are filled and validation errors are resolved before proceeding',
  },
});

export const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
