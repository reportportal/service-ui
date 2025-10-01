import { useModal } from 'common/hooks';

import { IMPORT_TEST_CASE_MODAL_KEY, ImportTestCaseModal } from './importTestCaseModal';

export const useImportTestCaseModal = () =>
  useModal({
    modalKey: IMPORT_TEST_CASE_MODAL_KEY,
    renderModal: () => <ImportTestCaseModal />,
  });
