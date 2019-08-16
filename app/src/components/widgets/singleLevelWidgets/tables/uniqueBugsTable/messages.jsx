import { defineMessages } from 'react-intl';
import {
  BUG_ID_COLUMN_KEY,
  SUBMIT_DATE_COLUMN_KEY,
  FOUND_IN_COLUMN_KEY,
  SUBMITTER_COLUMN_KEY,
} from './constants';

export const COLUMN_NAMES_MAP = defineMessages({
  [BUG_ID_COLUMN_KEY]: {
    id: 'UniqueBugsTable.bugIDColumn',
    defaultMessage: 'BUG ID',
  },
  [SUBMIT_DATE_COLUMN_KEY]: {
    id: 'UniqueBugsTable.submitDateColumn',
    defaultMessage: 'SUBMIT DATE',
  },
  [FOUND_IN_COLUMN_KEY]: {
    id: 'UniqueBugsTable.foundInColumn',
    defaultMessage: 'FOUND IN',
  },
  [SUBMITTER_COLUMN_KEY]: {
    id: 'UniqueBugsTable.submitterColumn',
    defaultMessage: 'SUBMITTER',
  },
});

export const hintMessages = defineMessages({
  submitDateHint: {
    id: 'UniqueBugsTable.submitDateHint',
    defaultMessage: 'Submit date:',
  },
});
