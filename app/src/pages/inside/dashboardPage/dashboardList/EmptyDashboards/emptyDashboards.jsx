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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { userRolesSelector } from 'controllers/pages';
import { userRolesType } from 'common/constants/projectRoles';
import { canWorkWithDashboard } from 'common/utils/permissions/permissions';
import { GhostButton } from 'components/buttons/ghostButton';
import { NoResultsForFilter } from 'pages/inside/common/noResultsForFilter';
import { DASHBOARD_EVENTS } from 'components/main/analytics/events/ga4Events/dashboardsPageEvents';
import track from 'react-tracking';
import styles from './emptyDashboards.scss';
import AddDashboardIcon from './img/ic-add-dash-inline.svg';

const cx = classNames.bind(styles);
const messages = defineMessages({
  currentUserDashboardsHeadline: {
    id: 'DashboardEmptyResults.currentUserDashboardsHeadline',
    defaultMessage: 'No dashboards yet',
  },
  currentUserDashboardsText: {
    id: 'DashboardEmptyResults.currentUserDashboardsText',
    defaultMessage: 'Add your first dashboard and widget to start analyzing the statistics',
  },
  currentUserDashboardsTextViewer: {
    id: 'DashboardEmptyResults.currentUserDashboardsTextViewer',
    defaultMessage: 'Dashboards will appear here once created by your team',
  },
  currentUserDashboardsActionText: {
    id: 'DashboardEmptyResults.currentUserDashboardsActionText',
    defaultMessage: 'Add New Dashboard',
  },
  noDashboardFound: {
    id: 'DashboardEmptyResults.noDashboardFound',
    defaultMessage: 'No dashboards found for "{filter}"',
  },
});

@track()
@injectIntl
@connect((state) => ({
  userRoles: userRolesSelector(state),
}))
export class EmptyDashboards extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    action: PropTypes.func,
    filter: PropTypes.string,
    userRoles: userRolesType,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    action: () => {},
    filter: '',
    userRoles: {},
  };

  handleAddDashboardAction = () => {
    const {
      action,
      tracking: { trackEvent },
    } = this.props;
    trackEvent(DASHBOARD_EVENTS.CLICK_ON_ADD_NEW_DASHBOARD_BTN);
    action();
  };

  render() {
    const { intl, filter, userRoles } = this.props;
    const isWorkWithDashboard = canWorkWithDashboard(userRoles);

    if (filter)
      return <NoResultsForFilter filter={filter} notFoundMessage={messages.noDashboardFound} />;

    return (
      <div className={cx('empty-dashboards')}>
        <div className={cx('empty-dashboard--current-user')} />
        <p className={cx('empty-dashboard-headline')}>
          {intl.formatMessage(messages.currentUserDashboardsHeadline)}
        </p>
        <p className={cx('empty-dashboard-text')}>
          {isWorkWithDashboard
            ? intl.formatMessage(messages.currentUserDashboardsText)
            : intl.formatMessage(messages.currentUserDashboardsTextViewer)}
        </p>
        {isWorkWithDashboard && (
          <div className={cx('empty-dashboard-content')}>
            <GhostButton icon={AddDashboardIcon} onClick={this.handleAddDashboardAction}>
              {intl.formatMessage(messages.currentUserDashboardsActionText)}
            </GhostButton>
          </div>
        )}
      </div>
    );
  }
}
