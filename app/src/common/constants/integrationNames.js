import { BTS_GROUP_TYPE, NOTIFICATION_GROUP_TYPE, OTHER_GROUP_TYPE } from './pluginsGroupTypes';

export const JIRA = 'jira';
export const RALLY = 'rally';
export const EMAIL = 'email';
export const SAUCE_LABS = 'saucelabs';

export const INTEGRATION_NAMES_BY_GROUP_TYPES_MAP = {
  [BTS_GROUP_TYPE]: [JIRA, RALLY],
  [NOTIFICATION_GROUP_TYPE]: [EMAIL],
  [OTHER_GROUP_TYPE]: [SAUCE_LABS],
};
