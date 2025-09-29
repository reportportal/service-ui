import { useDispatch, useSelector } from 'react-redux';
import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { getTestCasesAction } from 'controllers/testCase';
import { useState } from 'react';

export interface TestStep {
  instructions: string;
  expectedResult: string;
  attachments?: string[];
}

const testFolderId = 1;

export const useAddTestCasesToTestPlan = ({
  selectedTestCases,
}: {
  selectedTestCases: (string | number)[];
}) => {
  const {
    isLoading: isAddTestCasesToTestPlanLoading,
    showSpinner,
    hideSpinner,
  } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const [selectedTestPlan, setSelectedTestPlan] = useState<{ id: number; name: string } | null>(
    null,
  );

  const addTestCasesToTestPlan = () => {
    showSpinner();

    const fetchPath: string = URLS.testPlanTestCasesBatch(
      projectKey,
      selectedTestPlan.id,
    ) as unknown as string;

    fetch(fetchPath, {
      method: 'post',
      data: {
        testCaseIds: selectedTestCases,
      },
    })
      .then(() => {
        dispatch(hideModalAction());
        dispatch(
          showSuccessNotification({
            messageId: 'testCasesAddingToTestPlanSuccess',
          }),
        );
        dispatch(getTestCasesAction({ testFolderId }));
      })
      .catch((error) => {
        dispatch(
          showErrorNotification({
            messageId: 'testCasesAddingToTestPlanFailed',
          }),
        );
        console.error(error);
      })
      .finally(() => {
        hideSpinner();
      });
  };

  return {
    selectedTestPlan,
    isAddTestCasesToTestPlanLoading,
    addTestCasesToTestPlan,
    setSelectedTestPlan,
  };
};
