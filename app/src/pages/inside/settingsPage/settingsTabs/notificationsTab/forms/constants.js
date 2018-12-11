export const labelWidth = 140;
export const launchStatuses = {
  ALWAYS: 'always',
  MORE_10: 'more10',
  MORE_20: 'more20',
  MORE_50: 'more50',
  FAILED: 'failed',
  TO_INVESTIGATE: 'toInvestigate',
};
export const defaultRecipient = {
  launchNameRule: [],
  recipients: [],
  informOwner: true,
  launchStatsRule: launchStatuses.ALWAYS,
  launchTagRule: [],
  submitted: false,
  confirmed: false,
};
