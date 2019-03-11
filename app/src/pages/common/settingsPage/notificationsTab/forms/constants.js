export const labelWidth = 140;
export const launchStatuses = {
  ALWAYS: 'always',
  MORE_10: 'more10',
  MORE_20: 'more20',
  MORE_50: 'more50',
  FAILED: 'failed',
  TO_INVESTIGATE: 'toInvestigate',
};
export const defaultCase = {
  launchNames: [],
  recipients: [],
  informOwner: true,
  sendCase: launchStatuses.ALWAYS,
  attributes: [],
  submitted: false,
  confirmed: false,
};
