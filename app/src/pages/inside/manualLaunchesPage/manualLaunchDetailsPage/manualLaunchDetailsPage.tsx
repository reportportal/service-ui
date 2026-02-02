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

import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MANUAL_LAUNCHES_PAGE } from 'controllers/pages';
import {
  getManualLaunchAction,
  manualLaunchFoldersSelector,
  manualLaunchTestCaseExecutionsSelector,
} from 'controllers/manualLaunch';
import {
  showNotification,
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPOGRAPHY_COLOR_TYPES,
  WARNING_NOTIFICATION_DURATION,
} from 'controllers/notification';
import {
  useProjectDetails,
  useManualLaunchId,
  useManualLaunchById,
  useActiveManualLaunchLoading,
} from 'hooks/useTypedSelector';

import { PageHeaderWithBreadcrumbsAndActions } from '../../common/pageHeaderWithBreadcrumbsAndActions';
import { PageLoader } from '../../testPlansPage/pageLoader';
import { EmptyManualLaunch } from './emptyState';
import { ManualLaunchFolders } from './manualLaunchFolders';
import { messages } from './messages';
import { messages as manualLaunchesMessages } from '../messages';
import { commonMessages } from '../../testPlansPage/commonMessages';

import styles from './manualLaunchDetailsPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchDetailsPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const launchId = useManualLaunchId();
  const launch = useManualLaunchById(launchId);
  const isLoading = useActiveManualLaunchLoading();
  const folders = useSelector(manualLaunchFoldersSelector);
  const executions = useSelector(manualLaunchTestCaseExecutionsSelector);

  useEffect(() => {
    if (!isLoading && isEmpty(launch) && launchId) {
      dispatch(
        showNotification({
          type: NOTIFICATION_TYPES.WARNING,
          message: formatMessage(messages.manualLaunchNotFoundRedirect),
          typographyColor: NOTIFICATION_TYPOGRAPHY_COLOR_TYPES.BLACK,
          duration: WARNING_NOTIFICATION_DURATION,
        }),
      );

      dispatch({
        type: MANUAL_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug },
      });
    }
  }, [isLoading, launch, launchId, dispatch, organizationSlug, projectSlug, formatMessage]);

  const handleRefresh = useCallback(() => {
    if (launchId) {
      dispatch(getManualLaunchAction({ launchId }));
    }
  }, [dispatch, launchId]);

  const breadcrumbDescriptors = [
    {
      id: 'manualLaunches',
      title: formatMessage(manualLaunchesMessages.manualLaunchesTitle),
      link: {
        type: MANUAL_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug },
      },
    },
    { id: 'manualLaunch', title: launch?.name || '' },
  ];

  const renderActions = () => (
    <Button
      variant="text"
      data-automation-id="refreshPageButton"
      icon={<RefreshIcon />}
      disabled={isLoading}
      onClick={handleRefresh}
    >
      {formatMessage(commonMessages.refreshPage)}
    </Button>
  );

  if (isLoading) {
    return (
      <SettingsLayout>
        <PageLoader />
      </SettingsLayout>
    );
  }

  const renderContent = () => {
    const hasData = folders.length > 0 || executions.length > 0;

    if (hasData) {
      return <ManualLaunchFolders />;
    }

    if (!launch?.statistics?.executions?.total) {
      return <EmptyManualLaunch />;
    }

    return null;
  };

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('manual-launch-details-page')}>
          <PageHeaderWithBreadcrumbsAndActions
            title={launch?.name || ''}
            breadcrumbDescriptors={breadcrumbDescriptors}
            actions={renderActions()}
          />
          <div className={cx('manual-launch-details-page__content')}>{renderContent()}</div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
