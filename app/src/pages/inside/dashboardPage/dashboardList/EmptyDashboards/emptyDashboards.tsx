/*
 * Copyright 2019 EPAM Systems
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

import { noop } from 'es-toolkit';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames, referenceDictionary } from 'common/utils';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { EmptyPageState } from 'pages/common';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { DASHBOARD_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';

import styles from './emptyDashboards.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  currentUserDashboardsHeadline: {
    id: 'DashboardEmptyResults.emptyHeadline',
    defaultMessage: 'No Dashboards created yet',
  },
  currentUserDashboardsText: {
    id: 'DashboardEmptyResults.emptyText',
    defaultMessage:
      "Track your project's progress and achievements by creating your first dashboard.",
  },
  currentUserDashboardsTextViewer: {
    id: 'DashboardEmptyResults.emptyTextViewer',
    defaultMessage:
      'Dashboards will appear here once created by team members with editing permissions. Contact your manager if you need access to create dashboards.',
  },
  currentUserDashboardsActionText: {
    id: 'DashboardEmptyResults.emptyActionText',
    defaultMessage: 'Create Dashboard',
  },
  noResultsDescription: {
    id: 'Common.noResultsDescription',
    defaultMessage:
      "Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.",
  },
});

interface EmptyDashboardsProps {
  action?: () => void;
  filter?: string;
}

export const EmptyDashboards = ({ action = noop, filter = '' }: EmptyDashboardsProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canWorkWithDashboard } = useUserPermissions();

  if (filter) {
    return (
      <div className={cx('no-results')}>
        <EmptyPageState
          label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
          description={formatMessage(messages.noResultsDescription)}
          emptyIcon={NoResultsIcon}
          hasPermission={false}
        />
      </div>
    );
  }

  const handleAddDashboard = () => {
    trackEvent(DASHBOARD_EVENTS.CLICK_ON_ADD_NEW_DASHBOARD_BTN);
    action();
  };

  const buttons = canWorkWithDashboard
    ? [
        {
          name: formatMessage(messages.currentUserDashboardsActionText),
          dataAutomationId: 'emptyStateAddDashboardButton',
          isCompact: true,
          handleButton: handleAddDashboard,
        },
      ]
    : [];

  return (
    <div className={cx('empty-dashboards')}>
      <EmptyStatePage
        title={formatMessage(messages.currentUserDashboardsHeadline)}
        description={formatMessage(
          canWorkWithDashboard
            ? messages.currentUserDashboardsText
            : messages.currentUserDashboardsTextViewer,
        )}
        imageType="dashboards"
        documentationLink={referenceDictionary.rpDoc}
        buttons={buttons}
      />
    </div>
  );
};
