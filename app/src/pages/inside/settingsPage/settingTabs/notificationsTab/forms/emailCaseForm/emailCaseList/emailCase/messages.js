import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  recipientsLabel: {
    id: 'EmailCase.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  recipientsPlaceholder: {
    id: 'EmailCase.recipientsPlaceholder',
    defaultMessage: 'Select team members',
  },
  recipientsHint: {
    id: 'EmailCase.recipientsHint',
    defaultMessage: 'Please enter correct email',
  },
  launchOwnerLabel: {
    id: 'EmailCase.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that received)',
  },
  inCaseLabel: {
    id: 'EmailCase.inCaseLabel',
    defaultMessage: 'In Case',
  },
  launchNamesLabel: {
    id: 'EmailCase.launchNamesLabel',
    defaultMessage: 'Launch Names (and)',
  },
  launchNamesPlaceholder: {
    id: 'EmailCase.launchNamesPlaceholder',
    defaultMessage: 'Select launches names',
  },
  launchNamesHint: {
    id: 'EmailCase.launchNamesHint',
    defaultMessage: 'At least 3 symbols required for autocomplete.',
  },
  launchNamesNote: {
    id: 'EmailCase.launchNamesNote',
    defaultMessage: 'Send notifications about selected launches finished',
  },
  tagsLabel: {
    id: 'EmailCase.tagsLabel',
    defaultMessage: 'Tags (and)',
  },
  tagsPlaceholder: {
    id: 'EmailCase.tagsPlaceholder',
    defaultMessage: 'Select tags',
  },
  tagsHint: {
    id: 'EmailCase.tagsHint',
    defaultMessage: 'At least 1 symbol required for autocomplete.',
  },
  tagsNote: {
    id: 'EmailCase.tagsNote',
    defaultMessage: 'Send notifications about launches containing specified tags',
  },
  dropdownValueAlways: {
    id: 'EmailCase.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  dropdownValueMore10: {
    id: 'EmailCase.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  dropdownValueMore20: {
    id: 'EmailCase.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  dropdownValueMore50: {
    id: 'EmailCase.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  dropdownValueFailed: {
    id: 'EmailCase.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  dropdownValueToInvestigate: {
    id: 'EmailCase.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
  controlPanelName: {
    id: 'EmailCase.controlPanelName',
    defaultMessage: 'Rule',
  },
  duplicationErrorMessage: {
    id: 'EmailCase.duplicationErrorMessage',
    defaultMessage: "Such notification rule already exists. You can't create duplicate.",
  },
});
