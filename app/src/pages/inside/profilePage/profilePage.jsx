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
import { USER_PROFILE_PAGE, adminProfileRouteSelector } from 'controllers/pages';
import { NavigationTabs } from 'components/main/navigationTabs';
import { PersonalInfoBlock } from './personalInfoBlock';
import { AccessTokenBlock } from './accessTokenBlock';
import { AssignedProjectsBlock } from './assignedProjectsBlock';
import { ConfigExamplesBlock } from './configExamplesBlock';
import { LocalizationBlock } from './localizationBlock';
import styles from './profilePage.scss';
import { API_KEYS_ROUTE, CONFIG_EXAMPLES_ROUTE, PROJECT_ASSIGNMENT_ROUTE } from './constants';

const cx = classNames.bind(styles);

const messages = defineMessages({
  profilePageTitle: {
    id: 'ProfilePage.title',
    defaultMessage: 'User profile',
  },
  profilePageProjectAssignmentTab: {
    id: 'ProfilePage.projectAssignmentTab',
    defaultMessage: 'PROJECT ASSIGNMENT',
  },
  profilePageProjectApiKeysTab: {
    id: 'ProfilePage.apiKeys',
    defaultMessage: 'API KEYS',
  },
  profilePageConfigurationExamplesTab: {
    id: 'ProfilePage.configurationExamples',
    defaultMessage: 'CONFIGURATION EXAMPLES',
  },
});

const getDefaultLinkConfig = (profileRoute) => ({
  type: USER_PROFILE_PAGE,
  payload: {
    profileRoute,
  },
});

const getNavigationTabsConfig = (formatMessage) => ({
  [PROJECT_ASSIGNMENT_ROUTE]: {
    name: formatMessage(messages.profilePageProjectAssignmentTab),
    link: getDefaultLinkConfig(PROJECT_ASSIGNMENT_ROUTE),
    component: <AssignedProjectsBlock />,
  },
  [API_KEYS_ROUTE]: {
    name: formatMessage(messages.profilePageProjectApiKeysTab),
    link: getDefaultLinkConfig(API_KEYS_ROUTE),
    component: <AccessTokenBlock />,
  },
  [CONFIG_EXAMPLES_ROUTE]: {
    name: formatMessage(messages.profilePageConfigurationExamplesTab),
    link: getDefaultLinkConfig(CONFIG_EXAMPLES_ROUTE),
    component: <ConfigExamplesBlock />,
  },
});

@connect((state) => ({
  activeTab: adminProfileRouteSelector(state),
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
            <article className={cx('section-wrapper')}>
              <PersonalInfoBlock />
            </article>
            <NavigationTabs
              config={getNavigationTabsConfig(this.props.intl.formatMessage)}
              activeTab={this.props.activeTab}
              onChangeTab={this.props.dispatch}
            />
          </div>
          <LocalizationBlock />
        </section>
      </div>
    </PageLayout>
  );
}
