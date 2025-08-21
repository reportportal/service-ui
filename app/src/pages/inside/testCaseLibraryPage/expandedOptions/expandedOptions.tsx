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

import { useState } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button, BaseIconButton, SearchIcon, PlusIcon } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash';

import { ScrollWrapper } from 'components/main/scrollWrapper';
import { showModalAction } from 'controllers/modal';
import { canCreateTestCaseFolder } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { FolderEmptyState } from '../emptyState/folder';
import { commonMessages } from '../commonMessages';
import { Folder } from './folder';
import { CREATE_FOLDER_MODAL_KEY } from './createFolderModal';

import styles from './expandedOptions.scss';
import { AllTestCasesPage } from '../allTestCasesPage';
import { useTestCases } from '../hooks/useTestCases';

const cx = classNames.bind(styles) as typeof classNames;

export const ExpandedOptions = () => {
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [isEmptyFolder, setIsEmptyFolder] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const folders = useSelector(foldersSelector);
  const userRoles = useSelector(userRolesSelector);
  const { filteredTestCases, loading, hasTestCases, searchValue, setSearchValue } = useTestCases();

  const setAllTestCases = () => {
    setActiveFolder(null);
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
          {canCreateTestCaseFolder(userRoles) && (
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
              <ul
                className={cx('folders-tree', 'folders-tree--outer')}
                role="tree"
                aria-labelledby="tree_label"
              >
                {folders.map((folder) => (
                  <Folder
                    folder={folder}
                    key={folder.name}
                    activeFolder={activeFolder}
                    setActiveFolder={setActiveFolder}
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
          {isEmptyFolder || !hasTestCases ? (
            <FolderEmptyState />
          ) : (
            <AllTestCasesPage
              testCases={filteredTestCases}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              loading={loading}
            />
          )}
        </div>
      </ScrollWrapper>
    </div>
  );
};
