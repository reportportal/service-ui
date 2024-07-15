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
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import {
  urlOrganizationAndProjectSelector,
  activeDashboardIdSelector,
  PROJECT_DASHBOARD_PAGE,
  PROJECT_DASHBOARD_ITEM_PAGE,
  userRolesSelector,
} from 'controllers/pages';
import {
  dashboardItemsSelector,
  dashboardItemPropTypes,
  totalDashboardsSelector,
  loadingSelector,
} from 'controllers/dashboard';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { NavLink } from 'components/main/navLink';
import { userRolesType } from 'common/constants/projectRoles';
import { canWorkWithDashboard } from 'common/utils/permissions/permissions';
import { AddDashboardButton } from './addDashboardButton';
import styles from './dashboardPageHeader.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  allDashboardsTitle: {
    id: 'DashboardPageHeader.allDashboardsTitle',
    defaultMessage: 'All dashboards',
  },
});

const DASHBOARD_PAGE_ITEM_VALUE = 'All';
const DASHBOARDS_LIMIT = 300;

@connect((state) => ({
  slugs: urlOrganizationAndProjectSelector(state),
  dashboardsToDisplay: dashboardItemsSelector(state),
  activeItemId: activeDashboardIdSelector(state),
  totalDashboards: totalDashboardsSelector(state),
  isLoading: loadingSelector(state),
  userRoles: userRolesSelector(state),
}))
@injectIntl
export class DashboardPageHeader extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeItemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dashboardsToDisplay: PropTypes.arrayOf(dashboardItemPropTypes),
    isLoading: PropTypes.bool,
    totalDashboards: PropTypes.number,
    userRoles: userRolesType,
    slugs: PropTypes.shape({
      organizationSlug: PropTypes.string.isRequired,
      projectSlug: PropTypes.string.isRequired,
    }),
  };

  static defaultProps = {
    activeItemId: '',
    dashboardsToDisplay: [],
    isLoading: true,
    totalDashboards: 0,
    userRoles: {},
  };

  getDashboardPageItem = () => {
    const {
      slugs: { organizationSlug, projectSlug },
    } = this.props;

    return {
      label: (
        <NavLink
          exact
          to={{
            type: PROJECT_DASHBOARD_PAGE,
            payload: { organizationSlug, projectSlug },
          }}
          className={cx('link')}
          activeClassName={cx('active-link')}
        >
          {this.props.intl.formatMessage(messages.allDashboardsTitle)}
        </NavLink>
      ),
      value: DASHBOARD_PAGE_ITEM_VALUE,
    };
  };

  createDashboardLink = (dashboardId) => {
    const {
      slugs: { organizationSlug, projectSlug },
    } = this.props;

    return {
      type: PROJECT_DASHBOARD_ITEM_PAGE,
      payload: { projectSlug, dashboardId, organizationSlug },
    };
  };

  generateOptions = () =>
    [this.getDashboardPageItem()].concat(
      this.props.dashboardsToDisplay.map((item) => ({
        label: (
          <NavLink
            to={this.createDashboardLink(item.id)}
            className={cx('link')}
            activeClassName={cx('active-link')}
          >
            {item.name}
          </NavLink>
        ),
        value: item.id,
      })),
    );

  render() {
    const { activeItemId, isLoading, totalDashboards, userRoles } = this.props;

    const isAboveLimit = totalDashboards >= DASHBOARDS_LIMIT;
    const disabled = isLoading || isAboveLimit || !canWorkWithDashboard(userRoles);

    return (
      <div className={cx('dashboard-page-header')}>
        <div className={cx('dashboards-nav-list-mobile')}>
          <InputDropdown
            options={this.generateOptions()}
            value={activeItemId || DASHBOARD_PAGE_ITEM_VALUE}
          />
        </div>
        <AddDashboardButton disabled={disabled} />
      </div>
    );
  }
}
