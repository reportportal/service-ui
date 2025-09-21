import { useDispatch } from 'react-redux';

import { showModalAction } from 'controllers/modal';

import { IMPORT_TEST_CASE_MODAL_KEY, ImportTestCaseModal } from './importTestCaseModal';

export const useImportTestCaseModal = () => {
  const dispatch = useDispatch();

  const openModal = () => {
    dispatch(
      showModalAction({
        id: IMPORT_TEST_CASE_MODAL_KEY,
        data: null,
        component: <ImportTestCaseModal />,
      }),
    );
  };

  return {
    openModal,
  };
};
