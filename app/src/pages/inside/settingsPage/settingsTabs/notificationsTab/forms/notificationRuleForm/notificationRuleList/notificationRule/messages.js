import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  recipientsLabel: {
    id: 'NotificationRule.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  recipientsPlaceholder: {
    id: 'NotificationRule.recipientsPlaceholder',
    defaultMessage: 'Select team members',
  },
  recipientsHint: {
    id: 'NotificationRule.recipientsHint',
    defaultMessage: 'Please enter correct email',
  },
  launchOwnerLabel: {
    id: 'NotificationRule.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that received)',
  },
  inCaseLabel: {
    id: 'NotificationRule.inCaseLabel',
    defaultMessage: 'In case',
  },
  launchNamesLabel: {
    id: 'NotificationRule.launchNamesLabel',
    defaultMessage: 'Launch names (and)',
  },
  launchNamesPlaceholder: {
    id: 'NotificationRule.launchNamesPlaceholder',
    defaultMessage: 'Select launches names',
  },
  launchNamesHint: {
    id: 'NotificationRule.launchNamesHint',
    defaultMessage: 'At least 3 symbols required for autocomplete.',
  },
  launchNamesNote: {
    id: 'NotificationRule.launchNamesNote',
    defaultMessage: 'Send notifications about selected launches finished',
  },
  attributesLabel: {
    id: 'NotificationRule.attributesLabel',
    defaultMessage: 'Attributes (and)',
  },
  tagsHint: {
    id: 'NotificationRule.tagsHint',
    defaultMessage: 'At least 1 symbol required for autocomplete.',
  },
  tagsNote: {
    id: 'NotificationRule.tagsNote',
    defaultMessage: 'Send notifications about launches containing specified tags',
  },
  dropdownValueAlways: {
    id: 'NotificationRule.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  dropdownValueMore10: {
    id: 'NotificationRule.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  dropdownValueMore20: {
    id: 'NotificationRule.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  dropdownValueMore50: {
    id: 'NotificationRule.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  dropdownValueFailed: {
    id: 'NotificationRule.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  dropdownValueToInvestigate: {
    id: 'NotificationRule.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
  controlPanelName: {
    id: 'NotificationRule.controlPanelName',
    defaultMessage: 'Rule',
  },
  duplicationErrorMessage: {
    id: 'NotificationRule.duplicationErrorMessage',
    defaultMessage: "Such notification rule already exists. You can't create duplicate.",
  },
});
