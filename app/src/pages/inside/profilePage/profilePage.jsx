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
  USER_PROFILE_SUB_PAGE,
  USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
  USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
} from 'controllers/pages';
import { allowDeleteAccountSelector } from 'controllers/appInfo/selectors';
import { NavigationTabs } from 'components/main/navigationTabs';
import {
  API_KEYS_ROUTE,
  CONFIG_EXAMPLES_ROUTE,
  ASSIGNMENTS_ROUTE,
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
    defaultMessage: 'Assignments',
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
    activeTab: ASSIGNMENTS_ROUTE,
    dispatch: () => {},
    allowDeleteAccount: false,
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.profilePageTitle) }];

  getRouteLink = (profileRoute) => {
    const { organizationSlug, projectSlug } = this.props;

    if (projectSlug && organizationSlug) {
      return {
        type: USER_PROFILE_SUB_PAGE_PROJECT_LEVEL,
        payload: {
          organizationSlug,
          projectSlug,
          profileRoute,
        },
      };
    } else if (organizationSlug) {
      return {
        type: USER_PROFILE_SUB_PAGE_ORGANIZATION_LEVEL,
        payload: {
          organizationSlug,
          profileRoute,
        },
      };
    }

    return {
      type: USER_PROFILE_SUB_PAGE,
      payload: {
        profileRoute,
      },
    };
  };

  getNavigationTabsConfig = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return {
      [ASSIGNMENTS_ROUTE]: {
        name: formatMessage(messages.profilePageProjectAssignmentTab),
        link: this.getRouteLink(ASSIGNMENTS_ROUTE),
        component: <AssignedProjectsBlock />,
      },
      [API_KEYS_ROUTE]: {
        name: formatMessage(messages.profilePageProjectApiKeysTab),
        link: this.getRouteLink(API_KEYS_ROUTE),
        component: <ApiKeys />,
        eventInfo: PROFILE_EVENTS.CLICK_API_KEYS_TAB_EVENT,
      },
      [CONFIG_EXAMPLES_ROUTE]: {
        name: formatMessage(messages.profilePageConfigurationExamplesTab),
        link: this.getRouteLink(CONFIG_EXAMPLES_ROUTE),
        component: <ConfigExamplesBlock />,
      },
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
              config={this.getNavigationTabsConfig()}
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
