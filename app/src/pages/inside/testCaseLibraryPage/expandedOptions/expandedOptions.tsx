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

import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button, BaseIconButton, SearchIcon, PlusIcon } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { showModalAction } from 'controllers/modal';

import {
  foldersSelector,
  getAllTestCasesAction,
  getTestCaseByFolderIdAction,
  isLoadingTestCasesSelector,
  testCasesSelector,
} from 'controllers/testCase';
import { FolderEmptyState } from '../emptyState/folder';
import { commonMessages } from '../commonMessages';
import { Folder } from './folder';
import { CREATE_FOLDER_MODAL_KEY } from './createFolderModal';
import { AllTestCasesPage } from '../allTestCasesPage';
import {
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationAndProjectSelector,
  urlFolderIdSelector,
} from 'controllers/pages';
import styles from './expandedOptions.scss';

const cx = classNames.bind(styles) as typeof classNames;

export const ExpandedOptions = () => {
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [isEmptyFolder, setIsEmptyFolder] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const folderId = useSelector(urlFolderIdSelector);
  const isLoadingTestCases = useSelector(isLoadingTestCasesSelector);
  const testCases = useSelector(testCasesSelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector) as {
    organizationSlug: string;
    projectSlug: string;
  };
  const folders = useSelector(foldersSelector);
  const folderIdNumber = Number(folderId);

  useEffect(() => {
    if (folderId !== '' && Number.isFinite(folderIdNumber)) {
      dispatch(getTestCaseByFolderIdAction({ folderId: folderIdNumber }));
    } else {
      dispatch(getAllTestCasesAction());
    }
  }, [folderId, dispatch]);

  useEffect(() => {
    setActiveFolder(folderId ? folderIdNumber : null);
  }, [folderId, folders]);

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
    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        testCasePageRoute: ['folder', id],
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
            <span className={cx('sidebar-header__title--counter')}>1234</span>
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
          <Button
            onClick={showCreateFolderModal}
            variant="text"
            icon={<PlusIcon />}
            className={cx('expanded-options__sidebar-actions--create')}
            adjustWidthOn="content"
          >
            {formatMessage(commonMessages.createFolder)}
          </Button>
        </div>
        <div className={cx('expanded-options__sidebar-folders-wrapper')}>
          <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
            <div className={cx('expanded-options__sidebar-folders')}>
              <ul
                className={cx('folders-tree', 'folders-tree--outer')}
                role="tree"
                aria-labelledby="tree_label"
              >
                {folders
                  .filter((folder) => !folder.parentFolderId)
                  .map((folder) => (
                    <Folder
                      folder={folder}
                      key={folder.id}
                      activeFolder={activeFolder}
                      setActiveFolder={handleFolderClick}
                      setIsEmptyFolder={setIsEmptyFolder}
                    />
                  ))}
              </ul>
            </div>
          </ScrollWrapper>
        </div>
      </div>
      <ScrollWrapper>
        <div className={cx('expanded-options__content')}>
          {isEmptyFolder ? (
            <FolderEmptyState />
          ) : (
            <AllTestCasesPage
              testCases={testCases}
              searchValue=""
              setSearchValue={() => {}}
              loading={isLoadingTestCases}
            />
          )}
        </div>
      </ScrollWrapper>
    </div>
  );
};
