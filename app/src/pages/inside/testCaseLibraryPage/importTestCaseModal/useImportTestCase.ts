import { useDispatch, useSelector } from 'react-redux';
import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { getTestCasesAction } from 'controllers/testCase';
import { useIntl } from 'react-intl';
import { messages } from './messages';

type ImportPayload = {
  file: File;
  testFolderId?: number;
  testFolderName?: string;
};

export const useImportTestCase = () => {
  const { isLoading: isImportingTestCases, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const importTestCases = async ({ file, testFolderId, testFolderName }: ImportPayload) => {
    if (!file) return;
    const hasId = typeof testFolderId === 'number';
    const hasName = !!testFolderName?.trim();

    const query: { testFolderId?: number; testFolderName?: string } = {};
    if (hasId && !hasName) query.testFolderId = testFolderId!;
    if (!hasId && hasName) query.testFolderName = testFolderName;

    if (!query.testFolderId && !query.testFolderName) {
      return;
    }

    showSpinner();
    try {
      const formData = new FormData();
      formData.append('file', file);

      await fetch(URLS.importTestCase(projectKey, query), {
        method: 'post',
        data: formData,
      });

      const folderDisplay = query.testFolderName;

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'importSuccessToFolder',
          values: { folderName: folderDisplay },
        }),
      );

      if (query.testFolderId) {
        dispatch(getTestCasesAction({ testFolderId: query.testFolderId }));
      } else {
        dispatch(getTestCasesAction({}));
      }
    } catch (error: unknown) {
      if (error instanceof Error && error?.message?.includes('tms_test_case_name_folder_unique')) {
        const message = formatMessage(messages.duplicateTestCaseName);
        return {
          ok: false,
          code: 'DUPLICATE_NAME',
          message,
          fieldErrors: { name: message },
        };
      } else {
        dispatch(
          showErrorNotification({
            messageId: 'importTestCaseFailed',
          }),
        );
      }
    } finally {
      hideSpinner();
    }
  };

  return { isImportingTestCases, importTestCases };
};
