import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isEmpty, isNumber } from 'es-toolkit/compat';

import { projectKeySelector } from 'controllers/project';
import { hideModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { Folder, FolderWithFullPath, foldersSelector } from 'controllers/testCase';
import { createFoldersBatchSuccessAction } from 'controllers/testCase/actionCreators';
import { useNavigateToFolder } from '../hooks/useNavigateToFolder';
import { NewFolderData, isNewFolderData } from '../utils/getFolderFromFormValues';

import { messages } from './messages';

type ImportQuery = {
  testFolderId?: number;
  testFolderName?: string;
};

type ImportPayload = {
  file: File;
  folderId?: number;
  destination?: FolderWithFullPath | NewFolderData;
};

type ApiError = {
  errorCode?: number;
  message?: string;
};

type ImportResponse = Folder[];

const API_ERROR_PREFIXES: Array<[string, keyof typeof messages]> = [
  ['CSV file is missing required header', 'csvMissingRequiredHeader'],
  ['File contains no valid data rows to import', 'noValidDataRows'],
];

const API_ERROR_CODE_MAP: Partial<Record<number, keyof typeof messages>> = {
  40016: 'csvMissingRequiredHeader',
};

const createQuery = ({ testFolderId, testFolderName }: ImportQuery): ImportQuery => {
  if (isNumber(testFolderId)) {
    return { testFolderId };
  }

  if (testFolderName?.trim()) {
    return { testFolderName };
  }

  return {};
};

export const useImportTestCase = () => {
  const { formatMessage } = useIntl();
  const { isLoading: isImportingTestCases, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const existingFolders = useSelector(foldersSelector);
  const { showSuccessNotification, showErrorNotification } = useNotification();
  const { navigateToFolderAfterAction } = useNavigateToFolder();

  const importTestCases = useCallback(
    async ({ file, folderId, destination }: ImportPayload) => {
      if (!file) {
        return;
      }

      const getTargetFolderQuery = (): ImportQuery => {
        if (isNumber(folderId)) {
          return createQuery({ testFolderId: folderId });
        }

        if (destination && isNewFolderData(destination)) {
          return createQuery({ testFolderName: destination.name });
        }

        if (destination) {
          return createQuery({ testFolderId: (destination as FolderWithFullPath).id });
        }

        return {};
      };

      const query = getTargetFolderQuery();

      if (!query.testFolderId && !query.testFolderName) {
        return;
      }

      showSpinner();

      try {
        const formData = new FormData();

        formData.append('file', file);

        const createdFolders = await fetch<ImportResponse>(URLS.importTestCase(projectKey, query), {
          method: 'post',
          data: formData,
        });

        const existingFolderIds = new Set(existingFolders.map(({ id }) => id));
        const newFolders = createdFolders.filter(({ id }) => !existingFolderIds.has(id));

        if (!isEmpty(newFolders)) {
          dispatch(createFoldersBatchSuccessAction(newFolders));
        }

        const targetFolderId =
          folderId ?? query.testFolderId ?? createdFolders.find((folder) => !folder.parentFolderId)?.id;

        if (targetFolderId) {
          navigateToFolderAfterAction({ targetFolderId });
        }

        dispatch(hideModalAction());

        showSuccessNotification({
          messageId: query.testFolderName ? 'importSuccessToFolder' : 'importSuccess',
          values: query.testFolderName ? { folderName: query.testFolderName } : undefined,
        });
      } catch (error: unknown) {
        const apiError = error as ApiError;
        const errorCode = apiError?.errorCode;
        const apiMessage = apiError?.message;

        const codeKey = errorCode != null ? API_ERROR_CODE_MAP[errorCode] : undefined;
        const prefixKey = API_ERROR_PREFIXES.find(([prefix]) => apiMessage?.startsWith(prefix))?.[1];
        const messageKey = codeKey ?? prefixKey;

        if (messageKey) {
          return formatMessage(messages[messageKey]);
        }

        showErrorNotification({
          messageId: 'importTestCaseFailed',
        });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      hideSpinner,
      projectKey,
      dispatch,
      formatMessage,
      existingFolders,
      showSuccessNotification,
      showErrorNotification,
      navigateToFolderAfterAction,
    ],
  );

  return { isImportingTestCases, importTestCases };
};
