import { useDispatch, useSelector } from 'react-redux';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { GET_TEST_CASE_DETAILS, getAllTestCasesAction } from 'controllers/testCase';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

interface UpdateTestCasePayload {
  name: string;
  priority: string;
  testFolderId: number;
}

interface BulkUpdateTestCasesPayload {
  testCaseIds: number[];
  priority: string;
}

export const useUpdateTestCase = () => {
  const { isLoading: isUpdateTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const updateTestCase = async (testCaseId: number, payload: UpdateTestCasePayload) => {
    try {
      showSpinner();

      await fetch(URLS.testCaseDetails(projectKey, testCaseId), {
        method: 'patch',
        data: { ...payload },
      });

      dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testCaseUpdatedSuccess',
        }),
      );
    } catch (error: unknown) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  const bulkUpdateTestCases = async (
    payload: BulkUpdateTestCasesPayload,
    clearSelection: () => void,
  ) => {
    try {
      showSpinner();

      await fetch(URLS.bulkUpdateTestCases(projectKey), {
        method: 'patch',
        data: { ...payload },
      });

      clearSelection();
      dispatch(getAllTestCasesAction());
      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId:
            payload.testCaseIds.length > 1 ? 'testCaseBulkUpdateSuccess' : 'testCaseUpdatedSuccess',
        }),
      );
    } catch (error: unknown) {
      dispatch(
        showErrorNotification({
          message: (error as Error).message,
        }),
      );
    } finally {
      hideSpinner();
    }
  };

  return { isUpdateTestCaseLoading, updateTestCase, bulkUpdateTestCases };
};
