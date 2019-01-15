import { defineMessages } from 'react-intl';

export const Messages = defineMessages({
  // Defect type
  product_bug: {
    id: 'defectTypesGroup.titleProductBug',
    defaultMessage: 'Product bug',
  },
  automation_bug: {
    id: 'defectTypesGroup.titleAutomationBug',
    defaultMessage: 'Automation bug',
  },
  system_issue: {
    id: 'defectTypesGroup.titleSystemIssue',
    defaultMessage: 'System issue',
  },
  no_defect: {
    id: 'defectTypesGroup.titleNoDefect',
    defaultMessage: 'No defect',
  },
  to_investigate: {
    id: 'defectTypesGroup.titleToInvestigate',
    defaultMessage: 'To investigate',
  },
  // Modal
  deleteModalTitle: {
    id: 'defectTypesGroup.modal.deleteModalTitle',
    defaultMessage: 'Delete Defect Type',
  },
  deleteModalConfirmationText: {
    id: 'defectTypesGroup.modal.deleteModalConfirmationText',
    defaultMessage:
      "Are you sure you want to delete the defect type? All Investigated as <b>'{defectType}'</b> defects will be marked as <b>'{defaultDefectGroup}'</b>.",
  },
  // Notifications
  deleteSuccessNotification: {
    id: 'defectTypesGroup.deleteSuccessNotification',
    defaultMessage: 'Defect type was successfully deleted',
  },
  deleteErrorNotification: {
    id: 'defectTypesGroup.deleteErrorNotification',
    defaultMessage: 'Failed to delete defect type',
  },
  updateSuccessNotification: {
    id: 'defectTypesGroup.updateSuccessNotification',
    defaultMessage: 'Completed successfully',
  },
  updateErrorNotification: {
    id: 'defectTypesGroup.updateErrorNotification',
    defaultMessage: 'Failed to update defect type',
  },
  createSuccessNotification: {
    id: 'defectTypesGroup.createSuccessNotification',
    defaultMessage: 'Completed successfully',
  },
  createErrorNotification: {
    id: 'defectTypesGroup.createErrorNotification',
    defaultMessage: 'Failed to create defect type',
  },
  // Input fields
  longNamePlaceholder: {
    id: 'defectTypesGroup.longNamePlaceholder',
    defaultMessage: 'Subtype name',
  },
  shortNamePlaceholder: {
    id: 'defectTypesGroup.shortNamePlaceholder',
    defaultMessage: 'Abbreviation',
  },
  // Form + Buttons
  addNewDefect: {
    id: 'defectTypesGroup.addNewDefect',
    defaultMessage: '{subTypesLeft} subtypes can be added',
  },
  addBtn: {
    id: 'defectTypesGroup.addSubType',
    defaultMessage: 'Add defect type',
  },
  noMoreDefectSlot: {
    id: 'defectTypesGroup.noMoreDefectSlot',
    defaultMessage: 'All {maxSubTypes} sub-types are already added',
  },
  locator: {
    id: 'defectTypesGroup.locator',
    defaultMessage: 'Locator: ',
  },
});
