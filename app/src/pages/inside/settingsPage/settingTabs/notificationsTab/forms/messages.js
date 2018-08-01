import { defineMessages } from 'react-intl';

export const emailCasesMessages = defineMessages({
  recipientsLabel: {
    id: 'EmailCases.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  recipientsPlaceholder: {
    id: 'EmailCases.recipientsPlaceholder',
    defaultMessage: 'Select team members',
  },
  recipientsHint: {
    id: 'EmailCases.recipientsHint',
    defaultMessage: 'Please enter correct email',
  },
  launchOwnerLabel: {
    id: 'EmailCases.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that received)',
  },
  inCaseLabel: {
    id: 'EmailCases.inCaseLabel',
    defaultMessage: 'In Case',
  },
  launchNamesLabel: {
    id: 'EmailCases.launchNamesLabel',
    defaultMessage: 'Launch Names (and)',
  },
  launchNamesPlaceholder: {
    id: 'EmailCases.launchNamesPlaceholder',
    defaultMessage: 'Select launches names',
  },
  launchNamesHint: {
    id: 'EmailCases.launchNamesHint',
    defaultMessage: 'At least 3 symbols required for autocomplete.',
  },
  launchNamesNote: {
    id: 'EmailCases.launchNamesNote',
    defaultMessage: 'Send notifications about selected launches finished',
  },
  tagsLabel: {
    id: 'EmailCases.tagsLabel',
    defaultMessage: 'Tags (and)',
  },
  tagsPlaceholder: {
    id: 'EmailCases.tagsPlaceholder',
    defaultMessage: 'Select tags',
  },
  tagsHint: {
    id: 'EmailCases.tagsHint',
    defaultMessage: 'At least 1 symbol required for autocomplete.',
  },
  tagsNote: {
    id: 'EmailCases.tagsNote',
    defaultMessage: 'Send notifications about launches containing specified tags',
  },
  dropdownValueAlways: {
    id: 'EmailCases.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  dropdownValueMore10: {
    id: 'EmailCases.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  dropdownValueMore20: {
    id: 'EmailCases.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  dropdownValueMore50: {
    id: 'EmailCases.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  dropdownValueFailed: {
    id: 'EmailCases.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  dropdownValueToInvestigate: {
    id: 'EmailCases.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
});
export const emailToggleMessages = defineMessages({
  toggleNotificationsLabel: {
    id: 'EmailToggle.toggleNotificationsLabel',
    defaultMessage: 'E-mail notification',
  },
  toggleNotificationsNote: {
    id: 'EmailToggle.toggleNotificationsNote',
    defaultMessage: 'Send e-mail notifications about launches finished',
  },
  turnOn: {
    id: 'EmailToggle.turnOn',
    defaultMessage: 'On',
  },
  turnOff: {
    id: 'EmailToggle.turnOff',
    defaultMessage: 'Off',
  },
});
