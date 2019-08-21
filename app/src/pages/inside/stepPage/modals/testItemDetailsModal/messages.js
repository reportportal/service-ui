import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  modalTitle: {
    id: 'TestItemDetailsModal.title',
    defaultMessage: 'Test item details',
  },
  testCaseId: {
    id: 'TestItemDetailsModal.testCaseId',
    defaultMessage: 'Unique test case id:',
  },
  duration: {
    id: 'TestItemDetailsModal.duration',
    defaultMessage: 'Duration:',
  },
  description: {
    id: 'TestItemDetailsModal.description',
    defaultMessage: 'Description:',
  },
  stacktrace: {
    id: 'TestItemDetailsModal.stacktrace',
    defaultMessage: 'Stacktrace:',
  },
  codeRef: {
    id: 'TestItemDetailsModal.codeRef',
    defaultMessage: 'Code reference:',
  },
  attributesLabel: {
    id: 'EditItemModal.attributesLabel',
    defaultMessage: 'Attributes',
  },
  parametersLabel: {
    id: 'TestItemDetailsModal.parametersLabel',
    defaultMessage: 'Parameters:',
  },
  descriptionPlaceholder: {
    id: 'EditItemModal.descriptionPlaceholder',
    defaultMessage: 'Enter test item description',
  },
  launchWarning: {
    id: 'EditItemModal.launchWarning',
    defaultMessage:
      'Change of description and attributes can affect your filtering results, widgets, trends',
  },
  itemUpdateSuccess: {
    id: 'EditItemModal.itemUpdateSuccess',
    defaultMessage: 'Completed successfully!',
  },
  detailsTabTitle: {
    id: 'EditItemModal.detailsTabTitle',
    defaultMessage: 'Details',
  },
  stackTraceTabTitle: {
    id: 'EditItemModal.stackTraceTabTitle',
    defaultMessage: 'Stack trace',
  },
});
