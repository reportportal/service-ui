import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { SubmissionError } from 'redux-form';
import { isEmpty, isNumber } from 'es-toolkit/compat';

import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner } from 'common/hooks';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

type ImportQuery = {
  testFolderId?: number;
  testFolderName?: string;
};

type ImportPayload = ImportQuery & {
  file: File;
};

const createQuery = ({ testFolderId, testFolderName }: ImportQuery) => {
  const hasId = isNumber(testFolderId);
  const hasName = !isEmpty(testFolderName?.trim());
  const query: ImportQuery = {};

  if (hasId && !hasName) {
    query.testFolderId = testFolderId;
  }

  if (!hasId && hasName) {
    query.testFolderName = testFolderName;
  }

  return query;
};

export const useImportTestCase = () => {
  const { isLoading: isImportingTestCases, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const importTestCases = async ({ file, testFolderId, testFolderName }: ImportPayload) => {
    if (!file) {
      return;
    }

    const query = createQuery({ testFolderId, testFolderName });

    if (!query.testFolderId && !query.testFolderName) {
      return;
    }

    const { testFolderName: resolvedFolderName } = query;

    showSpinner();

    try {
      const formData = new FormData();

      formData.append('file', file);

      await fetch(URLS.importTestCase(projectKey, query), {
        method: 'post',
        data: formData,
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: resolvedFolderName ? 'importSuccessToFolder' : 'importSuccess',
          values: resolvedFolderName ? { folderName: resolvedFolderName } : undefined,
        }),
      );
    } catch (error: unknown) {
      if (error instanceof Error && error?.message?.includes('tms_test_case_name_folder_unique')) {
        throw new SubmissionError({
          name: formatMessage(commonMessages.duplicateTestCaseName),
        });
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
