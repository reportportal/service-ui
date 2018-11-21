import { defineMessages } from 'react-intl';
import { BUG_ID, SUBMIT_DATE, FOUND_IN, SUBMITTER } from './constants';

export const COLUMN_NAMES_MAP = defineMessages({
  [BUG_ID]: {
    id: 'UniqueBugsTable.bugIDColumn',
    defaultMessage: 'BUG ID',
  },
  [SUBMIT_DATE]: {
    id: 'UniqueBugsTable.submitDateColumn',
    defaultMessage: 'SUBMIT DATE',
  },
  [FOUND_IN]: {
    id: 'UniqueBugsTable.foundInColumn',
    defaultMessage: 'FOUND IN',
  },
  [SUBMITTER]: {
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
