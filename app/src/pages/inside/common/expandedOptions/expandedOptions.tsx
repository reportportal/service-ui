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

import { ReactNode, useState, useMemo, useCallback, ChangeEvent } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { BaseIconButton, SearchIcon, FieldText } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { INSTANCE_KEYS } from 'pages/inside/common/expandedOptions/folder/useFolderTooltipItems';
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
  folders: {
    id: 'expandedOptions.folders',
    defaultMessage: 'Folders',
  },
  searchPlaceholder: {
    id: 'expandedOptions.searchPlaceholder',
    defaultMessage: 'Type to filter folders by name',
  },
  noFoldersFound: {
    id: 'expandedOptions.noFoldersFound',
    defaultMessage: 'No results found',
  },
  noFoldersFoundMessage: {
    id: 'expandedOptions.noFoldersFoundMessage',
    defaultMessage: "Your search criteria didn't match any results. Please try different keywords.",
  },
});

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
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalTestCases = folders.reduce(
    (total: number, currentFolder: TransformedFolder): number => {
      const countFolderTestCases = (folder: TransformedFolder) => {
        return (folder.folders ?? []).reduce(
          (subTotal: number, subFolder: TransformedFolder): number =>
            subTotal + countFolderTestCases(subFolder),
          folder.testsCount || 0,
        );
      };
      return total + countFolderTestCases(currentFolder);
    },
    0,
  );

  // Filter folders based on search query (client-side)
  // Returns folders that match or have matching descendants, with isMatch flag
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;

    const query = searchQuery.toLowerCase().trim();

    const filterTree = (
      nodes: TransformedFolder[],
    ): (TransformedFolder & { isMatch?: boolean })[] => {
      if (!nodes || !Array.isArray(nodes)) return [];

      return nodes.reduce<(TransformedFolder & { isMatch?: boolean })[]>((acc, node) => {
        const isMatch = node.name.toLowerCase().includes(query);
        const filteredChildren = filterTree(node.folders || []);
        const hasMatchingChildren = !isEmpty(filteredChildren);

        if (isMatch || hasMatchingChildren) {
          acc.push({
            ...node,
            folders: filteredChildren,
            isMatch,
          });
        }

        return acc;
      }, []);
    };

    return filterTree(folders);
  }, [searchQuery, folders]);

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible((prev) => {
      if (prev) {
        setSearchQuery('');
      }

      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

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
          <BaseIconButton
            className={cx('expanded-options__sidebar-actions--search', {
              'expanded-options__sidebar-actions--search-active': isSearchVisible,
            })}
            onClick={handleSearchToggle}
          >
            <SearchIcon />
          </BaseIconButton>
          {renderCreateFolderButton?.()}
        </div>
        {isSearchVisible && (
          <div className={cx('expanded-options__search-wrapper')}>
            <FieldText
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              placeholder={formatMessage(messages.searchPlaceholder)}
              defaultWidth={false}
              clearable
              startIcon={<SearchIcon />}
            />
          </div>
        )}
        <div
          className={cx('expanded-options__sidebar-folders-wrapper', {
            'expanded-options__sidebar-folders-wrapper--with-search': isSearchVisible,
          })}
        >
          <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
            <div className={cx('expanded-options__sidebar-folders')}>
              <ul
                className={cx('folders-tree', 'folders-tree--outer')}
                role="tree"
                aria-labelledby="tree_label"
              >
                {!isEmpty(filteredFolders) ? (
                  filteredFolders.map((folder, idx) => (
                    <Folder
                      folder={folder}
                      key={folder.id || `${folder.name}-${idx}`}
                      activeFolder={activeFolder}
                      setActiveFolder={onFolderClick}
                      setAllTestCases={setAllTestCases}
                      instanceKey={instanceKey}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <li className={cx('folders-tree__no-results')}>
                    <div className={cx('folders-tree__no-results-icon')}>
                      <SearchIcon />
                    </div>
                    <div className={cx('folders-tree__no-results-title')}>
                      {formatMessage(messages.noFoldersFound)}
                    </div>
                    <div className={cx('folders-tree__no-results-message')}>
                      {formatMessage(messages.noFoldersFoundMessage)}
                    </div>
                  </li>
                )}
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
