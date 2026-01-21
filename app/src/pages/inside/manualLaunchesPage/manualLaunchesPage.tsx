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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { Button, RefreshIcon, Pagination } from '@reportportal/ui-kit';

import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { createClassnames } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper/scrollWrapper';
import { useProjectDetails } from 'hooks/useTypedSelector';
import {
  manualLaunchContentSelector,
  isLoadingSelector,
  manualLaunchPageSelector,
  getManualLaunchesAction,
  MANUAL_LAUNCHES_NAMESPACE,
  defaultManualLaunchesQueryParams,
} from 'controllers/manualLaunch';

import { messages } from './messages';
import { ManualLaunchesPageContent } from './manualLaunchesPageContent';
import { commonMessages } from '../testPlansPage/commonMessages';
import { ITEMS_PER_PAGE_OPTIONS } from './manualLaunchesList/contants';
import { useURLBoundPagination } from '../common/testCaseList/useURLBoundPagination';

import styles from './manualLaunchesPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchesPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector) as string;
  const content = useSelector(manualLaunchContentSelector);
  const pageInfo = useSelector(manualLaunchPageSelector);
  const isLoading = useSelector(isLoadingSelector);
  const { organizationSlug, projectSlug } = useProjectDetails();

  const { activePage, pageSize, setPageNumber, setPageSize, totalPages, captions, offset } =
    useURLBoundPagination({
      pageData: pageInfo,
      defaultQueryParams: defaultManualLaunchesQueryParams,
      namespace: MANUAL_LAUNCHES_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl: `/organizations/${organizationSlug}/projects/${projectSlug}/manualLaunches`,
    });

  const handleRefresh = useCallback(() => {
    dispatch(getManualLaunchesAction({ offset, limit: pageSize }));
  }, [dispatch, offset, pageSize]);

  return (
    <div className={cx('manual-launches-page')}>
      <LocationHeaderLayout
        title={formatMessage(messages.manualLaunchesTitle)}
        organizationName={organizationName}
        projectName={projectName}
      >
        {!isEmpty(content) && (
          <Button
            variant="text"
            data-automation-id="refreshPageButton"
            icon={<RefreshIcon />}
            disabled={isLoading}
            onClick={handleRefresh}
          >
            {formatMessage(commonMessages.refreshPage)}
          </Button>
        )}
      </LocationHeaderLayout>
      <ScrollWrapper resetRequired>
        <ManualLaunchesPageContent fullLaunches={content} isLoading={isLoading} />
        {Boolean(pageInfo?.totalElements) && (
          <div className={cx('pagination')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={pageInfo?.totalElements || 0}
              totalPages={totalPages}
              pageSizeOptions={ITEMS_PER_PAGE_OPTIONS}
              changePage={setPageNumber}
              changePageSize={setPageSize}
              captions={captions}
            />
          </div>
        )}
      </ScrollWrapper>
    </div>
  );
};
