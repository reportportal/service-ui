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

import { useMemo, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { isEmpty } from 'es-toolkit/compat';
import { BreadcrumbsTreeIcon, BubblesLoader, Button, FilterOutlineIcon, FilterFilledIcon } from '@reportportal/ui-kit';

import { createClassnames, debounce } from 'common/utils';
import { ProjectDetails } from 'pages/organization/constants';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SettingsLayout } from 'layouts/settingsLayout';
import ImportIcon from 'common/img/import-thin-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import { projectNameSelector } from 'controllers/project';
import {
  PROJECT_DASHBOARD_PAGE,
  urlFolderIdSelector,
  urlOrganizationAndProjectSelector,
  locationSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { areFoldersLoadingSelector, foldersSelector } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { SearchField } from 'components/fields/searchField';
import { TestCasePageDefaultValues } from 'pages/inside/common/testCaseList/constants';
import { FilterSidePanel } from 'pages/inside/common/testCaseList/filterSidePanel';
import { messages as testCaseListMessages } from 'pages/inside/common/testCaseList/messages';

import { TestCaseFolders } from './testCaseFolders';
import { MainPageEmptyState } from './emptyState/mainPage';
import { commonMessages } from './commonMessages';
import { useCreateTestCaseModal } from './createTestCaseModal';
import { useImportTestCaseModal } from './importTestCaseModal';

import styles from './testCaseLibraryPage.scss';

const cx = createClassnames(styles);

export const TestCaseLibraryPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const folders = useSelector(foldersSelector);
  const folderId = useSelector(urlFolderIdSelector);
  const areFoldersLoading = useSelector(areFoldersLoadingSelector);
  const location = useSelector(locationSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const { openModal: openCreateTestCaseModal } = useCreateTestCaseModal();
  const { openModal: openImportFolderModal } = useImportTestCaseModal();

  const [searchValue, setSearchValue] = useState(location?.query?.testCasesSearchParams || '');
  const [isFilterSidePanelVisible, setIsFilterSidePanelVisible] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { canManageTestCases } = useUserPermissions();
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const hasFolders = !isEmpty(folders);

  const activeFiltersCount =
    (isEmpty(selectedPriorities) ? 0 : 1) + (isEmpty(selectedTags) ? 0 : 1);
  const hasActiveFilters = activeFiltersCount > 0;

  const handleFilterChange = useCallback(
    // eslint-disable-next-line react-hooks/use-memo
    debounce((value: string) => {
      dispatch(
        updatePagePropertiesAction({
          testCasesSearchParams: value,
          ...TestCasePageDefaultValues,
        }),
      );
    }, SEARCH_DELAY),
    [dispatch],
  );

  const handleCloseFilterSidePanel = () => {
    setIsFilterSidePanelVisible(false);
  };

  const handleFilterIconClick = () => {
    setIsFilterSidePanelVisible(true);
  };

  const handleApplyFilters = () => {
    // TODO: Implement apply filters functionality
  };

  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  const currentFolderName = useMemo(
    () => folders.find(({ id }) => id === Number(folderId))?.name,
    [folderId, folders],
  );

  const renderContent = () => {
    if (areFoldersLoading) {
      return <BubblesLoader />;
    }

    if (hasFolders) {
      return <TestCaseFolders />;
    }

    return <MainPageEmptyState />;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('test-case-library-page')}>
          <div className={cx('test-case-library-page__header')}>
            <div className={cx('test-case-library-page__breadcrumb')}>
              <BreadcrumbsTreeIcon />
              <Breadcrumbs descriptors={breadcrumbDescriptors} />
            </div>
            <div className={cx('test-case-library-page__title')}>
              {formatMessage(commonMessages.testCaseLibraryHeader)}
            </div>
            <div className={cx('test-case-library-page__right-section')}>
              <div className={cx('test-case-library-page__actions')}>
                <SearchField
                  isLoading={areFoldersLoading}
                  searchValue={searchValue}
                  placeholder={formatMessage(testCaseListMessages.searchPlaceholder)}
                  setSearchValue={setSearchValue}
                  onFilterChange={handleFilterChange}
                />
                <button
                  type="button"
                  className={cx('test-case-library-page__filter-icon', { active: hasActiveFilters })}
                  aria-label={formatMessage(testCaseListMessages.filterButton)}
                  onClick={handleFilterIconClick}
                >
                  {hasActiveFilters ? (
                    <>
                      <FilterFilledIcon />
                      <span className={cx('test-case-library-page__filter-count')}>{activeFiltersCount}</span>
                    </>
                  ) : (
                    <FilterOutlineIcon />
                  )}
                </button>
              </div>
              {hasFolders && (
                <div className={cx('test-case-library-page__actions')}>
                  {canManageTestCases && (
                    <>
                      <Button
                        variant="text"
                        icon={Parser(ImportIcon as unknown as string)}
                        data-automation-id="importTestCase"
                        adjustWidthOn="content"
                        onClick={() => openImportFolderModal({ folderName: currentFolderName ?? '' })}
                      >
                        {formatMessage(COMMON_LOCALE_KEYS.IMPORT)}
                      </Button>
                      <Button
                        variant="ghost"
                        data-automation-id="createTestCase"
                        onClick={() => openCreateTestCaseModal()}
                      >
                        {formatMessage(commonMessages.createTestCase)}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div
            className={cx('test-case-library-page__content', {
              'test-case-library-page__content--no-padding': hasFolders,
            })}
          >
            {renderContent()}
          </div>
          <FilterSidePanel
            isVisible={isFilterSidePanelVisible}
            onClose={handleCloseFilterSidePanel}
            selectedPriorities={selectedPriorities}
            selectedTags={selectedTags}
            onPrioritiesChange={setSelectedPriorities}
            onTagsChange={setSelectedTags}
            onApply={handleApplyFilters}
          />
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
