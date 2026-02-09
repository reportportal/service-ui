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

import { useIntl } from 'react-intl';
import { BaseIconButton, SearchIcon, FieldText } from '@reportportal/ui-kit';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptySearchState } from 'pages/common/emptySearchState';

import { Folder } from './folder';
import { messages } from './messages';
import { ExpandedOptionsProps } from './types';
import { useFolderSearch } from './useFolderSearch';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);

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

  const {
    searchQuery,
    isSearchVisible,
    searchInputRef,
    searchWrapperRef,
    filteredFolders,
    hasAnyMatch,
    effectiveExpandedIds,
    handleToggleFolder,
    handleSearchChange,
    handleSearchClear,
    handleMagnifierClick,
  } = useFolderSearch({ folders, expandedIds, onToggleFolder });

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
          <BaseIconButton
            className={cx('expanded-options__sidebar-actions--search', {
              'expanded-options__sidebar-actions--search-active': isSearchVisible || !!searchQuery,
            })}
            onClick={handleMagnifierClick}
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
                      expandedIds={effectiveExpandedIds}
                      onFolderClick={onFolderClick}
                      setAllTestCases={setAllTestCases}
                      onToggleFolder={handleToggleFolder}
                      searchQuery={searchQuery}
                    />
                  ))
                ) : (
                  <EmptySearchState />
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
