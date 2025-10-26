import { useModal } from 'common/hooks';

import ImportTestCaseModal, {
  IMPORT_TEST_CASE_MODAL_KEY,
  ImportTestCaseFormValues,
} from './importTestCaseModal';

export const useImportTestCaseModal = () =>
  useModal<ImportTestCaseFormValues>({
    modalKey: IMPORT_TEST_CASE_MODAL_KEY,
    renderModal: (data) => {
      return <ImportTestCaseModal data={data} />;
    },
  });
