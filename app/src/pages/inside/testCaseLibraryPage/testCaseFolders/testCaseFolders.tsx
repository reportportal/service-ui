/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button, PlusIcon } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import {
  transformedFoldersSelector,
  areFoldersLoadingSelector,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
  isLoadingTestCasesSelector,
  testCasesSelector,
  foldersSelector,
} from 'controllers/testCase';

import { showModalAction } from 'controllers/modal';
import { ExpandedOptions } from '../../common/expandedOptions';
import { commonMessages } from '../commonMessages';
import { CREATE_FOLDER_MODAL_KEY } from './createFolderModal';
import { AllTestCasesPage } from '../allTestCasesPage';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlFolderIdSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import styles from './testCaseFolders.scss';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showNotification,
} from 'controllers/notification';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltip';

const cx = classNames.bind(styles) as typeof classNames;

export const TestCaseFolders = () => {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const folderId = useSelector(urlFolderIdSelector);
  const isLoadingTestCases = useSelector(isLoadingTestCasesSelector);
  const testCases = useSelector(testCasesSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const initialFolders = useSelector(foldersSelector);
  const folders = useSelector(transformedFoldersSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const { canCreateTestCaseFolder } = useUserPermissions();
  const folderIdNumber = Number(folderId);

  const currentFolder = useMemo(() => {
    return initialFolders.find(({ id }) => id === Number(folderId));
  }, [folderId, initialFolders]);

  useEffect(() => {
    if (folderId && !currentFolder) {
      setAllTestCases();

      dispatch(
        showNotification({
          messageId: 'redirectWarningMessage',
          type: NOTIFICATION_TYPES.WARNING,
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );
    }
  }, [currentFolder, folderId]);

  useEffect(() => {
    if (currentFolder && folderId !== '' && Number.isFinite(folderIdNumber)) {
      dispatch(getTestCaseByFolderIdAction({ folderId: folderIdNumber }));
    } else if (!currentFolder && folderId === '') {
      dispatch(getAllTestCasesAction());
    }
  }, [currentFolder, folderId, folderIdNumber, dispatch]);

  useEffect(() => {
    setActiveFolder(folderId ? folderIdNumber : null);
  }, [folderId, folderIdNumber]);

  const setAllTestCases = () => {
    setActiveFolder(null);
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
      },
    });
  };

  const handleFolderClick = (id: number) => {
    setActiveFolder(id);
    dispatch(getTestCaseByFolderIdAction({ folderId: id }));
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        testCasePageRoute: `folder/${id}`,
        organizationSlug,
        projectSlug,
      },
    });
  };

  const showCreateFolderModal = () => {
    dispatch(
      showModalAction({
        id: CREATE_FOLDER_MODAL_KEY,
        data: {
          shouldRenderToggle: !isEmpty(folders),
        },
        component: null,
      }),
    );
  };

  const renderCreateFolderButton = () => {
    return canCreateTestCaseFolder ? (
      <Button
        onClick={showCreateFolderModal}
        variant="text"
        icon={<PlusIcon />}
        className={cx('sidebar-actions__create')}
        adjustWidthOn="content"
      >
        {formatMessage(commonMessages.createFolder)}
      </Button>
    ) : null;
  };

  return (
    <ExpandedOptions
      activeFolder={activeFolder}
      setAllTestCases={setAllTestCases}
      folders={folders}
      handleFolderClick={handleFolderClick}
      renderCreateFolderButton={renderCreateFolderButton}
      instanceKey={INSTANCE_KEYS.TEST_CASE_FOLDER}
    >
      <AllTestCasesPage
        testCases={testCases}
        searchValue=""
        setSearchValue={() => {}}
        loading={isLoadingTestCases || areFoldersLoading}
      />
    </ExpandedOptions>
  );
};
