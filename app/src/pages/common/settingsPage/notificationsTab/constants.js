export const LABEL_WIDTH = 140;

export const RECIPIENTS_FIELD_KEY = 'recipients';
export const INFORM_OWNER_FIELD_KEY = 'informOwner';
export const SEND_CASE_FIELD_KEY = 'sendCase';
export const LAUNCH_NAMES_FIELD_KEY = 'launchNames';
export const ATTRIBUTES_FIELD_KEY = 'attributes';
export const ENABLED_FIELD_KEY = 'enabled';

export const LAUNCH_CASES = {
  ALWAYS: 'always',
  MORE_10: 'more10',
  MORE_20: 'more20',
  MORE_50: 'more50',
  FAILED: 'failed',
  TO_INVESTIGATE: 'toInvestigate',
};

export const DEFAULT_CASE_CONFIG = {
  recipients: [],
  informOwner: true,
  sendCase: LAUNCH_CASES.ALWAYS,
  launchNames: [],
  attributes: [],
};
