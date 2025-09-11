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
});
