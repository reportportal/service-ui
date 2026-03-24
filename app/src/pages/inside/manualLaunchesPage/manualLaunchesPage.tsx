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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { Button, RefreshIcon, Pagination } from '@reportportal/ui-kit';

import { projectNameSelector } from 'controllers/project';
import { SettingsLayout } from 'layouts/settingsLayout';
import { createClassnames, debounce } from 'common/utils';
import { SEARCH_DELAY } from 'common/constants/delayTime';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import {
  PROJECT_DASHBOARD_PAGE,
  urlOrganizationAndProjectSelector,
  locationSelector,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';
import {
  manualLaunchContentSelector,
  isLoadingSelector,
  manualLaunchPageSelector,
  getManualLaunchesAction,
  MANUAL_LAUNCHES_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';
import { SearchField } from 'components/fields/searchField';

import { messages } from './messages';
import { ManualLaunchesPageContent } from './manualLaunchesPageContent';
import { commonMessages } from '../testPlansPage/commonMessages';
import { ITEMS_PER_PAGE_OPTIONS } from './manualLaunchesList/contants';
import { useURLBoundPagination } from '../common/testCaseList/useURLBoundPagination';
import { PageHeaderWithBreadcrumbsAndActions } from '../common/pageHeaderWithBreadcrumbsAndActions';

import styles from './manualLaunchesPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchesPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectName = useSelector(projectNameSelector);
  const content = useSelector(manualLaunchContentSelector);
  const pageInfo = useSelector(manualLaunchPageSelector);
  const isLoading = useSelector(isLoadingSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const location = useSelector(locationSelector);

  const [searchValue, setSearchValue] = useState(location?.query?.searchQuery || '');

  useEffect(() => {
    const querySearch = location?.query?.searchQuery || '';

    setSearchValue(querySearch);
  }, [location?.query?.searchQuery]);

  const appliedSearchQuery = location?.query?.searchQuery || '';

  const isSearchLoading = searchValue !== appliedSearchQuery || isLoading;

  const debouncedUpdateSearch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch(
          updatePagePropertiesAction({
            searchQuery: value.trim(),
            offset: 0,
          }),
        );
      }, SEARCH_DELAY),
    [dispatch],
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      debouncedUpdateSearch(value);
    },
    [debouncedUpdateSearch],
  );

  const { activePage, pageSize, setPageNumber, setPageSize, totalPages, captions, offset } =
    useURLBoundPagination({
      pageData: pageInfo,
      defaultQueryParams: defaultManualLaunchesQueryParams,
      namespace: MANUAL_LAUNCHES_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/manualLaunches`,
    });

  const handleRefresh = useCallback(() => {
    dispatch(
      getManualLaunchesAction({
        offset,
        limit: pageSize,
        searchQuery: appliedSearchQuery || undefined,
      }),
    );
  }, [dispatch, offset, pageSize, appliedSearchQuery]);

  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [{ id: 'project', title: projectName, link: projectLink }];

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(messages.manualLaunchesTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          {...((!isEmpty(content) || appliedSearchQuery || searchValue) && {
            actions: (
              <>
                <SearchField
                  isLoading={isSearchLoading}
                  searchValue={searchValue}
                  placeholder={formatMessage(messages.searchPlaceholder)}
                  setSearchValue={setSearchValue}
                  onFilterChange={handleFilterChange}
                />
                <Button
                  variant="text"
                  data-automation-id="refreshPageButton"
                  icon={<RefreshIcon />}
                  disabled={isLoading}
                  onClick={handleRefresh}
                >
                  {formatMessage(commonMessages.refreshPage)}
                </Button>
              </>
            ),
          })}
        />
        <div className={cx('content-wrapper')}>
          <ManualLaunchesPageContent
            fullLaunches={content}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            searchQuery={appliedSearchQuery}
          />
        </div>
        {Boolean(pageInfo?.totalElements) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={pageInfo?.totalElements || 0}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              captions={captions}
              changePage={setPageNumber}
              changePageSize={setPageSize}
            />
          </div>
        )}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
