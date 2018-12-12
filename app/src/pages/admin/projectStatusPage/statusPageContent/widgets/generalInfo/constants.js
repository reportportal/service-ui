import { defineMessages } from 'react-intl';

export const LAUNCHES_PER_WEEK = 'launchesPerWeek';
export const LAUNCHES_QUANTITY = 'launchesQuantity';
export const USERS_QUANTITY = 'usersQuantity';
export const UNIQUE_TICKETS = 'uniqueTickets';

const messages = defineMessages({
  [LAUNCHES_QUANTITY]: {
    id: 'GeneralInfo.launchesQuantity',
    defaultMessage: 'launches',
  },
  [LAUNCHES_PER_WEEK]: {
    id: 'GeneralInfo.launchesPerWeek',
    defaultMessage: 'launches average per week',
  },
  [USERS_QUANTITY]: {
    id: 'GeneralInfo.usersQuantity',
    defaultMessage: 'members',
  },
  [UNIQUE_TICKETS]: {
    id: 'GeneralInfo.uniqueTickets',
    defaultMessage: 'unique bug posted',
  },
});

export const INFO_CONFIG = {
  [LAUNCHES_QUANTITY]: messages[LAUNCHES_QUANTITY],
  [LAUNCHES_PER_WEEK]: messages[LAUNCHES_PER_WEEK],
  [USERS_QUANTITY]: messages[USERS_QUANTITY],
  [UNIQUE_TICKETS]: messages[UNIQUE_TICKETS],
};
