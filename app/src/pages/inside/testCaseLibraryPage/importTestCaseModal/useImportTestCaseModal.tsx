import { useModal } from 'common/hooks';

import ImportTestCaseModal, {
  IMPORT_TEST_CASE_MODAL_KEY,
  ImportTestCaseModalData,
} from './importTestCaseModal';

export const useImportTestCaseModal = () =>
  useModal<ImportTestCaseModalData>({
    modalKey: IMPORT_TEST_CASE_MODAL_KEY,
    renderModal: () => <ImportTestCaseModal />,
  });
