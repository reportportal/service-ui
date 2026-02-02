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

import { ReactNode } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BaseIconButton, SearchIcon } from '@reportportal/ui-kit';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';

import { Folder } from './folder';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  allTestCases: {
    id: 'expandedOptions.allTestCases',
    defaultMessage: 'All Test Cases',
  },
  allTestExecutions: {
    id: 'expandedOptions.allTestExecutions',
    defaultMessage: 'All Tests Executions',
  },
  folders: {
    id: 'expandedOptions.folders',
    defaultMessage: 'Folders',
  },
});

interface ExpandedOptionsProps {
  folders: TransformedFolder[];
  activeFolderId: number | null;
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  children: ReactNode;
  instanceKey?: TMS_INSTANCE_KEY;
  renderCreateFolderButton?: () => ReactNode;
  expandedIds?: number[];
  onToggleFolder?: (folder: TransformedFolder) => void;
}

export const ExpandedOptions = ({
  folders,
  activeFolderId,
  instanceKey,
  children,
  setAllTestCases,
  renderCreateFolderButton,
  onFolderClick,
  expandedIds: customExpandedIds,
  onToggleFolder: customOnToggleFolder,
}: ExpandedOptionsProps) => {
  const { formatMessage } = useIntl();

  // Use custom props if provided (for Manual Launch), otherwise use storage hook (for Test Cases/Plans)
  const storageHook = useStorageFolders(customExpandedIds === undefined ? instanceKey : undefined);
  const expandedIds = customExpandedIds ?? storageHook.expandedIds;
  const onToggleFolder = customOnToggleFolder ?? storageHook.onToggleFolder;

  const allItemsTitle =
    instanceKey === TMS_INSTANCE_KEY.MANUAL_LAUNCH
      ? formatMessage(messages.allTestExecutions)
      : formatMessage(messages.allTestCases);

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

  return (
    <div className={cx('expanded-options')}>
      <div className={cx('expanded-options__sidebar')}>
        <div className={cx('sidebar-header')}>
          <button
            type="button"
            className={cx('sidebar-header__title', {
              'sidebar-header__title--active': activeFolderId === null,
            })}
            onClick={setAllTestCases}
          >
            <span className={cx('sidebar-header__title--text')}>{allItemsTitle}</span>
            <span className={cx('sidebar-header__title--counter')}>
              {totalTestCases.toLocaleString()}
            </span>
          </button>
        </div>
        <div className={cx('expanded-options__sidebar-separator')} />
        <div className={cx('expanded-options__sidebar-actions')}>
          <div className={cx('expanded-options__sidebar-actions--title')} id="tree_label">
            {formatMessage(messages.folders)}
          </div>
          <BaseIconButton className={cx('expanded-options__sidebar-actions--search')}>
            <SearchIcon />
          </BaseIconButton>
          {renderCreateFolderButton?.()}
        </div>
        <div className={cx('expanded-options__sidebar-folders-wrapper')}>
          <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
            <div className={cx('expanded-options__sidebar-folders')}>
              <ul
                className={cx('folders-tree', 'folders-tree--outer')}
                role="tree"
                aria-labelledby="tree_label"
              >
                {folders.map((folder, idx) => (
                  <Folder
                    folder={folder}
                    key={folder.id || `${folder.name}-${idx}`}
                    activeFolder={activeFolderId}
                    instanceKey={instanceKey}
                    expandedIds={expandedIds}
                    onFolderClick={onFolderClick}
                    setAllTestCases={setAllTestCases}
                    onToggleFolder={onToggleFolder}
                  />
                ))}
              </ul>
            </div>
          </ScrollWrapper>
        </div>
      </div>
      <ScrollWrapper>
        <div className={cx('expanded-options__content')}>{children}</div>
      </ScrollWrapper>
    </div>
  );
};
