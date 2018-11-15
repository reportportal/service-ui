import { FormattedMessage, defineMessages } from 'react-intl';
import { BUG_ID, SUBMIT_DATE, FOUND_IN, SUBMITTER } from './constants';

const bugIDColumnTitle = (
  <FormattedMessage id={'UniqueBugsTable.bugIDColumn'} defaultMessage={'BUG ID'} />
);

const submitDateColumnTitle = (
  <FormattedMessage id={'UniqueBugsTable.submitDateColumn'} defaultMessage={'SUBMIT DATE'} />
);

const foundInColumnTitle = (
  <FormattedMessage id={'UniqueBugsTable.foundInColumn'} defaultMessage={'FOUND IN'} />
);

const submitterColumnTitle = (
  <FormattedMessage id={'UniqueBugsTable.submitterColumn'} defaultMessage={'SUBMITTER'} />
);

export const COLUMN_NAMES_MAP = {
  [BUG_ID]: {
    full: bugIDColumnTitle,
    short: bugIDColumnTitle,
  },
  [SUBMIT_DATE]: {
    full: submitDateColumnTitle,
    short: submitDateColumnTitle,
  },
  [FOUND_IN]: {
    full: foundInColumnTitle,
    short: foundInColumnTitle,
  },
  [SUBMITTER]: {
    full: submitterColumnTitle,
    short: submitterColumnTitle,
  },
};

export const hintMessages = defineMessages({
  submitDateHint: {
    id: 'UniqueBugsTable.submitDateHint',
    defaultMessage: 'Submit date:',
  },
});
