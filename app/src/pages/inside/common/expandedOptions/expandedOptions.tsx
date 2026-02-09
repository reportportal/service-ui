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

import { ReactNode, useState, useCallback, ChangeEvent, useRef, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { BaseIconButton, SearchIcon, FieldText } from '@reportportal/ui-kit';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { useOnClickOutside } from 'common/hooks';

import { Folder } from './folder';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);

/**
 * Recursively checks if a folder or any of its descendants match the search query
 */
const hasMatchInTree = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return true;

  const lowerQuery = query.toLowerCase().trim();
  if (folder.name.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  return (folder.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
};

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
  activeFolderId: number | null;
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  children: ReactNode;
  instanceKey: TMS_INSTANCE_KEY;
  renderCreateFolderButton?: () => ReactNode;
}

export const ExpandedOptions = ({
  folders,
  activeFolderId,
  instanceKey,
  children,
  setAllTestCases,
  renderCreateFolderButton,
  onFolderClick,
}: ExpandedOptionsProps) => {
  const { formatMessage } = useIntl();

  const { expandedIds, onToggleFolder } = useStorageFolders(instanceKey);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Auto-focus search input when it becomes visible
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Close search on outside click if field is empty
  useOnClickOutside(searchWrapperRef, () => {
    if (isSearchVisible && !searchQuery) {
      setIsSearchVisible(false);
    }
  });

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

  const handleSearchToggle = useCallback(() => {
    setIsSearchVisible((prev) => {
      if (prev) {
        setSearchQuery('');
        return false;
      }
      // If opening with empty search, show it
      // If search has content, toggle will only trigger with empty field (handled by click)
      return true;
    });
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    // Hide search field when clearing
    setIsSearchVisible(false);
  }, []);

  // Filter folders to only show those with matches in their tree
  const filteredFolders = searchQuery
    ? folders.filter((folder) => hasMatchInTree(folder, searchQuery))
    : folders;

  const hasAnyMatch = filteredFolders.length > 0;

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
          <BaseIconButton
            className={cx('expanded-options__sidebar-actions--search', {
              'expanded-options__sidebar-actions--search-active': isSearchVisible,
            })}
            onClick={() => {
              if (isSearchVisible && !searchQuery) {
                // Close if search is open and empty
                setIsSearchVisible(false);
              } else {
                handleSearchToggle();
              }
            }}
          >
            <SearchIcon />
          </BaseIconButton>
          {renderCreateFolderButton?.()}
        </div>
        {isSearchVisible && (
          <div ref={searchWrapperRef} className={cx('expanded-options__search-wrapper')}>
            <FieldText
              ref={searchInputRef}
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
                {hasAnyMatch ? (
                  filteredFolders.map((folder, idx) => (
                    <Folder
                      folder={folder}
                      key={folder.id || `${folder.name}-${idx}`}
                      activeFolder={activeFolderId}
                      instanceKey={instanceKey}
                      expandedIds={expandedIds}
                      onFolderClick={onFolderClick}
                      setAllTestCases={setAllTestCases}
                      onToggleFolder={onToggleFolder}
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
