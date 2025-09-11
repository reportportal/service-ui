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
    id: 'ImportTestCase.incorrectFileFormat',
    defaultMessage: 'File format is not supported',
  },
  incorrectFileSize: {
    id: 'ImportTestCase.incorrectFileSize',
    defaultMessage: 'File size exceeds the limit',
  },
  dropCsvOr: { id: 'ImportTestCase.dropCsvOr', defaultMessage: 'Drop .CSV file or' },
  browse: { id: 'ImportTestCase.browse', defaultMessage: 'Browse' },
  toAttach: { id: 'ImportTestCase.toAttach', defaultMessage: 'to attach' },
  fileSizeMessage: {
    id: 'ImportTestCase.fileSizeMessage',
    defaultMessage: 'File size should be up to {size} MB',
  },
});
