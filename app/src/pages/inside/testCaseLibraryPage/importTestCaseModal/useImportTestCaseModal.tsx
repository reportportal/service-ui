import { useModal } from 'common/hooks';
import ImportTestCaseModal, { IMPORT_TEST_CASE_MODAL_KEY } from './importTestCaseModal';

export const useImportTestCaseModal = () =>
  useModal<{ folderName?: string }>({
    modalKey: IMPORT_TEST_CASE_MODAL_KEY,
    renderModal: () => <ImportTestCaseModal />,
  });
