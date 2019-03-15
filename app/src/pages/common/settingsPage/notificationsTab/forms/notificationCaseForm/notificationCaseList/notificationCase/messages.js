import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  recipientsLabel: {
    id: 'NotificationCase.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  recipientsPlaceholder: {
    id: 'NotificationCase.recipientsPlaceholder',
    defaultMessage: 'Select team members',
  },
  recipientsHint: {
    id: 'NotificationCase.recipientsHint',
    defaultMessage: 'Please enter correct email',
  },
  launchOwnerLabel: {
    id: 'NotificationCase.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that received)',
  },
  inCaseLabel: {
    id: 'NotificationCase.inCaseLabel',
    defaultMessage: 'In case',
  },
  launchNamesLabel: {
    id: 'NotificationCase.launchNamesLabel',
    defaultMessage: 'Launch names (and)',
  },
  launchNamesPlaceholder: {
    id: 'NotificationCase.launchNamesPlaceholder',
    defaultMessage: 'Select launches names',
  },
  launchNamesHint: {
    id: 'NotificationCase.launchNamesHint',
    defaultMessage: 'At least 3 symbols required for autocomplete.',
  },
  launchNamesNote: {
    id: 'NotificationCase.launchNamesNote',
    defaultMessage: 'Send notifications about selected launches finished',
  },
  attributesLabel: {
    id: 'NotificationCase.attributesLabel',
    defaultMessage: 'Attributes (and)',
  },
  attributesNote: {
    id: 'NotificationCase.attributesNote',
    defaultMessage: 'Send notifications about launches containing specified attributes',
  },
  dropdownValueAlways: {
    id: 'NotificationCase.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  dropdownValueMore10: {
    id: 'NotificationCase.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  dropdownValueMore20: {
    id: 'NotificationCase.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  dropdownValueMore50: {
    id: 'NotificationCase.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  dropdownValueFailed: {
    id: 'NotificationCase.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  dropdownValueToInvestigate: {
    id: 'NotificationCase.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
  controlPanelName: {
    id: 'NotificationCase.controlPanelName',
    defaultMessage: 'Rule',
  },
  duplicationErrorMessage: {
    id: 'NotificationCase.duplicationErrorMessage',
    defaultMessage: "Such notification rule already exists. You can't create duplicate.",
  },
});
