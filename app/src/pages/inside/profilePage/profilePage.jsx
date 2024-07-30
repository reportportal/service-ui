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
import track from 'react-tracking';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { PageLayout, PageHeader } from 'layouts/pageLayout';
import { PROFILE_PAGE } from 'components/main/analytics/events';
import {
  userProfileRouteSelector,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
  USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
  USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_SUB_PAGE_INSTANCE_LEVEL,
} from 'controllers/pages';
import { allowDeleteAccountSelector } from 'controllers/appInfo/selectors';
import { NavigationTabs } from 'components/main/navigationTabs';
import {
  API_KEYS_ROUTE,
  CONFIG_EXAMPLES_ROUTE,
  PROJECT_ASSIGNMENT_ROUTE,
} from 'common/constants/userProfileRoutes';
import { DeleteAccountBlock } from 'pages/inside/profilePage/deleteAccountBlock';
import { PROFILE_EVENTS } from 'analyticsEvents/profilePageEvent';
import { PersonalInfoBlock } from './personalInfoBlock';
import { ApiKeys } from './apiKeys';
import { AssignedProjectsBlock } from './assignedProjectsBlock';
import { ConfigExamplesBlock } from './configExamplesBlock';
import { LocalizationBlock } from './localizationBlock';
import styles from './profilePage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  profilePageTitle: {
    id: 'ProfilePage.title',
    defaultMessage: 'User profile',
  },
  profilePageProjectAssignmentTab: {
    id: 'ProfilePage.projectAssignmentTab',
    defaultMessage: 'Project assignment',
  },
  profilePageProjectApiKeysTab: {
    id: 'ProfilePage.apiKeys',
    defaultMessage: 'API keys',
  },
  profilePageConfigurationExamplesTab: {
    id: 'ProfilePage.configurationExamples',
    defaultMessage: 'Configuration examples',
  },
});

const getProfilePageLink = (profileRoute, typeRoute, organizationSlug, projectSlug) => ({
  type: typeRoute,
  payload: {
    profileRoute,
    organizationSlug,
    projectSlug,
  },
});

const getNavigationTabsConfig = (
  formatMessage,
  { typeRoute, projectAssignmentRoute, apyKeysRoute, configRoute, organizationSlug, projectSlug },
) => ({
  [projectAssignmentRoute]: {
    name: formatMessage(messages.profilePageProjectAssignmentTab),
    link: getProfilePageLink(projectAssignmentRoute, typeRoute, organizationSlug, projectSlug),
    component: <AssignedProjectsBlock />,
  },
  [apyKeysRoute]: {
    name: formatMessage(messages.profilePageProjectApiKeysTab),
    link: getProfilePageLink(apyKeysRoute, typeRoute, organizationSlug, projectSlug),
    component: <ApiKeys />,
    eventInfo: PROFILE_EVENTS.CLICK_API_KEYS_TAB_EVENT,
  },
  [configRoute]: {
    name: formatMessage(messages.profilePageConfigurationExamplesTab),
    link: getProfilePageLink(configRoute, typeRoute, organizationSlug, projectSlug),
    component: <ConfigExamplesBlock />,
  },
});

@connect((state) => ({
  activeTab: userProfileRouteSelector(state),
  allowDeleteAccount: allowDeleteAccountSelector(state),
  organizationSlug: urlOrganizationSlugSelector(state),
  projectSlug: urlProjectSlugSelector(state),
}))
@injectIntl
@track({ page: PROFILE_PAGE })
export class ProfilePage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeTab: PropTypes.string,
    dispatch: PropTypes.func,
    allowDeleteAccount: PropTypes.bool,
    organizationSlug: PropTypes.string.isRequired,
    projectSlug: PropTypes.string.isRequired,
  };

  static defaultProps = {
    activeTab: PROJECT_ASSIGNMENT_ROUTE,
    dispatch: () => {},
    allowDeleteAccount: false,
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.profilePageTitle) }];

  getTypeRoute = () => {
    const { organizationSlug, projectSlug } = this.props;
    const tabRoutes = {
      projectAssignmentRoute: PROJECT_ASSIGNMENT_ROUTE,
      apyKeysRoute: API_KEYS_ROUTE,
      configRoute: CONFIG_EXAMPLES_ROUTE,
    };

    if (projectSlug) {
      return {
        ...tabRoutes,
        typeRoute: USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
        organizationSlug,
        projectSlug,
      };
    }

    if (organizationSlug && !projectSlug) {
      return {
        ...tabRoutes,
        typeRoute: USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
        organizationSlug,
      };
    }

    return {
      ...tabRoutes,
      typeRoute: USER_PROFILE_SUB_PAGE_INSTANCE_LEVEL,
    };
  };

  render = () => (
    <PageLayout>
      <PageHeader breadcrumbs={this.getBreadcrumbs()} />
      <div className={cx('container')}>
        <section className={cx('content-wrapper')}>
          <div className={cx('section-wrapper')}>
            <PersonalInfoBlock />
            <NavigationTabs
              config={getNavigationTabsConfig(this.props.intl.formatMessage, this.getTypeRoute())}
              activeTab={this.props.activeTab}
              onChangeTab={this.props.dispatch}
            />
          </div>
          <div className={cx('footer')}>
            <LocalizationBlock />
            {this.props.allowDeleteAccount && <DeleteAccountBlock />}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
