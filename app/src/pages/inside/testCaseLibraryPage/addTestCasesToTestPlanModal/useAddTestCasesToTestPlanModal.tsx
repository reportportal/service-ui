import { showModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';
import {
  ADD_TO_TEST_PLAN_MODAL_KEY,
  AddTestCasesToTestPlanModal,
} from './addTestCasesToTestPlanModal';

export const useAddTestCasesToTestPlanModal = ({
  selectedTestCases,
}: {
  selectedTestCases: (number | string)[];
}) => {
  const dispatch = useDispatch();

  const openModal = () => {
    dispatch(
      showModalAction({
        id: ADD_TO_TEST_PLAN_MODAL_KEY,
        data: null,
        component: <AddTestCasesToTestPlanModal selectedTestCases={selectedTestCases} />,
      }),
    );
  };

  return {
    openModal,
  };
};
