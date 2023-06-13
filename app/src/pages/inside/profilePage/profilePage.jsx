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
import { userProfileRouteSelector, USER_PROFILE_SUB_PAGE } from 'controllers/pages';
import { NavigationTabs } from 'components/main/navigationTabs';
import {
  API_KEYS_ROUTE,
  CONFIG_EXAMPLES_ROUTE,
  PROJECT_ASSIGNMENT_ROUTE,
} from 'common/constants/userProfileRoutes';
import { DeleteAccountBlock } from 'pages/inside/profilePage/deleteAccountBlock';
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

const getProfilePageLink = (profileRoute) => ({
  type: USER_PROFILE_SUB_PAGE,
  payload: {
    profileRoute,
  },
});

const getNavigationTabsConfig = (formatMessage) => ({
  [PROJECT_ASSIGNMENT_ROUTE]: {
    name: formatMessage(messages.profilePageProjectAssignmentTab),
    link: getProfilePageLink(PROJECT_ASSIGNMENT_ROUTE),
    component: <AssignedProjectsBlock />,
  },
  [API_KEYS_ROUTE]: {
    name: formatMessage(messages.profilePageProjectApiKeysTab),
    link: getProfilePageLink(API_KEYS_ROUTE),
    component: <ApiKeys />,
  },
  [CONFIG_EXAMPLES_ROUTE]: {
    name: formatMessage(messages.profilePageConfigurationExamplesTab),
    link: getProfilePageLink(CONFIG_EXAMPLES_ROUTE),
    component: <ConfigExamplesBlock />,
  },
});

@connect((state) => ({
  activeTab: userProfileRouteSelector(state),
}))
@injectIntl
@track({ page: PROFILE_PAGE })
export class ProfilePage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeTab: PropTypes.string,
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    activeTab: PROJECT_ASSIGNMENT_ROUTE,
    dispatch: () => {},
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.profilePageTitle) }];

  render = () => (
    <PageLayout>
      <PageHeader breadcrumbs={this.getBreadcrumbs()} />
      <div className={cx('container')}>
        <section className={cx('content-wrapper')}>
          <div>
            <div className={cx('section-wrapper')}>
              <PersonalInfoBlock />
            </div>
            <NavigationTabs
              config={getNavigationTabsConfig(this.props.intl.formatMessage)}
              activeTab={this.props.activeTab}
              onChangeTab={this.props.dispatch}
            />
          </div>
          <div className={cx('footer')}>
            <DeleteAccountBlock />
            <LocalizationBlock />
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
