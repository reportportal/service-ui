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
import { Button, BaseIconButton, SearchIcon, PlusIcon } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import {
  transformedFoldersSelector,
  areFoldersLoadingSelector,
  TransformedFolder,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
  isLoadingTestCasesSelector,
  testCasesSelector,
  foldersSelector,
} from 'controllers/testCase';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { showModalAction } from 'controllers/modal';
import { commonMessages } from '../commonMessages';
import { Folder } from './folder';
import { CREATE_FOLDER_MODAL_KEY } from './createFolderModal';
import { AllTestCasesPage } from '../allTestCasesPage';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlFolderIdSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import styles from './expandedOptions.scss';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
  showNotification,
} from 'controllers/notification';

const cx = classNames.bind(styles) as typeof classNames;

export const ExpandedOptions = () => {
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

  const totalTestCases = folders.reduce((total: number, folder: TransformedFolder): number => {
    const countFolderTestCases = (folder: TransformedFolder): number => {
      return (folder.folders ?? []).reduce(
        (subTotal: number, subFolder: TransformedFolder): number =>
          subTotal + countFolderTestCases(subFolder),
        folder.testsCount || 0,
      );
    };
    return total + countFolderTestCases(folder);
  }, 0);

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

  return (
    <div className={cx('expanded-options')}>
      <div className={cx('expanded-options__sidebar')}>
        <div className={cx('sidebar-header')}>
          <button
            type="button"
            className={cx('sidebar-header__title', {
              'sidebar-header__title--active': activeFolder === null,
            })}
            onClick={setAllTestCases}
          >
            <span className={cx('sidebar-header__title--text')}>
              {formatMessage(commonMessages.allTestCases)}
            </span>
            <span className={cx('sidebar-header__title--counter')}>
              {areFoldersLoading ? '...' : totalTestCases.toLocaleString()}
            </span>
          </button>
        </div>
        <div className={cx('expanded-options__sidebar-separator')} />
        <div className={cx('expanded-options__sidebar-actions')}>
          <div className={cx('expanded-options__sidebar-actions--title')} id="tree_label">
            {formatMessage(commonMessages.folders)}
          </div>
          <BaseIconButton className={cx('expanded-options__sidebar-actions--search')}>
            <SearchIcon />
          </BaseIconButton>
          {canCreateTestCaseFolder && (
            <Button
              onClick={showCreateFolderModal}
              variant="text"
              icon={<PlusIcon />}
              className={cx('expanded-options__sidebar-actions--create')}
              adjustWidthOn="content"
            >
              {formatMessage(commonMessages.createFolder)}
            </Button>
          )}
        </div>
        <div className={cx('expanded-options__sidebar-folders-wrapper')}>
          <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
            <div className={cx('expanded-options__sidebar-folders')}>
              {areFoldersLoading ? (
                <div className={cx('folders-loading')} role="status" aria-live="polite">
                  <div className={cx('folders-loading__text')}>
                    {formatMessage(commonMessages.loadingFolders)}
                  </div>
                </div>
              ) : (
                <ul
                  className={cx('folders-tree', 'folders-tree--outer')}
                  role="tree"
                  aria-labelledby="tree_label"
                >
                  {folders.map((folder, idx) => (
                    <Folder
                      folder={folder}
                      key={folder.id || `${folder.name}-${idx}`}
                      activeFolder={activeFolder}
                      setActiveFolder={handleFolderClick}
                      setAllTestCases={setAllTestCases}
                    />
                  ))}
                </ul>
              )}
            </div>
          </ScrollWrapper>
        </div>
      </div>
      <ScrollWrapper>
        <div className={cx('expanded-options__content')}>
          <AllTestCasesPage
            testCases={testCases}
            searchValue=""
            setSearchValue={() => {}}
            loading={isLoadingTestCases || areFoldersLoading}
          />
        </div>
      </ScrollWrapper>
    </div>
  );
};
