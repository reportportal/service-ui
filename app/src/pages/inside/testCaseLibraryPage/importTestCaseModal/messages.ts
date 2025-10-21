import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  downloadDescription: {
    id: 'ImportTestCaseModal.downloadDescription',
    defaultMessage:
      'You can download a sample CSV file, that shows you which data structure is needed for the import.',
  },
  downloadTemplate: {
    id: 'ImportTestCaseModal.downloadTemplate',
    defaultMessage: 'Download template',
  },
  importFolderNameLabel: {
    id: 'ImportTestCaseModal.importFolderNameLabel',
    defaultMessage: 'Import folder name',
  },
  importFolderNameDescription: {
    id: 'ImportTestCaseModal.importFolderNameDescription',
    defaultMessage:
      'Imported test cases will be stored in a folder. Choose another name if you’d like.',
  },
  incorrectFileFormat: {
    id: 'ImportTestCaseModal.incorrectFileFormat',
    defaultMessage: 'File format is not supported',
  },
  incorrectFileSize: {
    id: 'ImportTestCaseModal.incorrectFileSize',
    defaultMessage: 'File size exceeds the limit',
  },
  dropCsvOr: { id: 'ImportTestCaseModal.dropCsvOr', defaultMessage: 'Drop .CSV file or' },
  browse: { id: 'ImportTestCaseModal.browse', defaultMessage: 'Browse' },
  toAttach: { id: 'ImportTestCaseModal.toAttach', defaultMessage: 'to attach' },
  fileSizeMessage: {
    id: 'ImportTestCaseModal.fileSizeMessage',
    defaultMessage: 'File size should be up to {size} MB',
  },
  selectedFolderName: {
    id: 'ImportTestCaseModal.selectedFolderName',
    defaultMessage: 'Accessibility compliance',
  },
});
