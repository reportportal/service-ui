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

import { ReactNode, useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BaseIconButton, SearchIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
import { TransformedFolder } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';

import { Folder } from './folder';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);
const STORAGE_KEY = 'expanded_folders_ids';

const messages = defineMessages({
  allTestCases: {
    id: 'expandedOptions.allTestCases',
    defaultMessage: 'All Test Cases',
  },
  folders: {
    id: 'expandedOptions.folders',
    defaultMessage: 'Folders',
  },
});

const getFolderAndDescendantIds = (folder: TransformedFolder): number[] => {
  let ids = [folder.id];
  if (folder.folders && folder.folders.length > 0) {
    folder.folders.forEach((subFolder) => {
      ids = ids.concat(getFolderAndDescendantIds(subFolder));
    });
  }
  return ids;
};

interface ExpandedOptionsProps {
  folders: TransformedFolder[];
  activeFolder: number | null;
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  children: ReactNode;
  instanceKey?: INSTANCE_KEYS;
  renderCreateFolderButton?: () => ReactNode;
}

export const ExpandedOptions = ({
  folders,
  activeFolder,
  setAllTestCases,
  onFolderClick,
  renderCreateFolderButton,
  instanceKey,
  children,
}: ExpandedOptionsProps) => {
  const { formatMessage } = useIntl();

  const [expandedIds, setExpandedIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });

  const onToggleFolder = useCallback((folder: TransformedFolder) => {
    setExpandedIds((prevIds) => {
      const isExpanded = prevIds.includes(folder.id);

      let newIds: number[];
      if (isExpanded) {
        const idsToRemove = getFolderAndDescendantIds(folder);
        newIds = prevIds.filter((id) => !idsToRemove.includes(id));
      } else {
        newIds = [...prevIds, folder.id];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
      return newIds;
    });
  }, []);

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
              'sidebar-header__title--active': activeFolder === null,
            })}
            onClick={setAllTestCases}
          >
            <span className={cx('sidebar-header__title--text')}>
              {formatMessage(messages.allTestCases)}
            </span>
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
                    activeFolder={activeFolder}
                    setActiveFolder={onFolderClick}
                    setAllTestCases={setAllTestCases}
                    instanceKey={instanceKey}
                    expandedIds={expandedIds}
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
