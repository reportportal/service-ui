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
import { defineMessages, injectIntl } from 'react-intl';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { canSeeDemoData } from 'common/utils/permissions';
import {
  GENERAL,
  INTEGRATIONS,
  NOTIFICATIONS,
  DEFECT,
  ANALYSIS,
  DEMO_DATA,
  PATTERN_ANALYSIS,
} from 'common/constants/settingsTabs';
import { settingsTabSelector } from 'controllers/pages';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { uiExtensionSettingsTabsSelector } from 'controllers/plugins';
import { SETTINGS_PAGE, SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { NavigationTabs } from 'components/main/navigationTabs';
import { GeneralTab } from './generalTab';
import { AutoAnalysisTab } from './autoAnalysisTab';
import { NotificationsTab } from './notificationsTab';
import { DemoDataTab } from './demoDataTab';
import { IntegrationsTab } from './integrationsTab';
import { DefectTypesTab } from './defectTypesTab';
import { PatternAnalysisTab } from './patternAnalysisTab';
import styles from './settingsPage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  general: {
    id: 'SettingsPage.general',
    defaultMessage: 'General',
  },
  notifications: {
    id: 'SettingsPage.notifications',
    defaultMessage: 'Notifications',
  },
  integrations: {
    id: 'SettingsPage.integrations',
    defaultMessage: 'Integrations',
  },
  defect: {
    id: 'SettingsPage.defect',
    defaultMessage: 'Defect types',
  },
  analysis: {
    id: 'SettingsPage.analysis',
    defaultMessage: 'Auto-Analysis',
  },
  demoData: {
    id: 'SettingsPage.demoData',
    defaultMessage: 'Demo data',
  },
  patternAnalysis: {
    id: 'SettingsPage.patternAnalysis',
    defaultMessage: 'Pattern-analysis',
  },
});

@connect(
  (state) => ({
    activeTab: settingsTabSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
    tabExtensions: uiExtensionSettingsTabsSelector(state),
  }),
  {
    onChangeTab: (linkAction) => linkAction,
  },
)
@injectIntl
@track({ page: SETTINGS_PAGE })
export class SettingsPage extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    createTabLink: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    onChangeTab: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    tabExtensions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        component: PropTypes.element.isRequired,
      }),
    ),
  };
  static defaultProps = {
    activeTab: GENERAL,
    tabExtensions: [],
  };

  createExtensionTabs = () =>
    this.props.tabExtensions.reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: {
          name: extension.title || extension.name,
          link: this.props.createTabLink(extension.name),
          component: extension.component,
          mobileDisabled: true,
        },
      }),
      {},
    );

  createTabsConfig = () => {
    const tabsConfig = {
      [GENERAL]: {
        name: this.props.intl.formatMessage(messages.general),
        link: this.props.createTabLink(GENERAL),
        component: <GeneralTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.GENERAL_TAB,
        mobileDisabled: true,
      },
      [INTEGRATIONS]: {
        name: (
          <span>
            {this.props.intl.formatMessage(messages.integrations)}
            <BetaBadge className={cx('beta')} />
          </span>
        ),
        link: this.props.createTabLink(INTEGRATIONS),
        component: <IntegrationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.INTEGRATIONS_TAB,
      },
      [NOTIFICATIONS]: {
        name: this.props.intl.formatMessage(messages.notifications),
        link: this.props.createTabLink(NOTIFICATIONS),
        component: <NotificationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.NOTIFICATIONS_TAB,
        mobileDisabled: true,
      },
      [DEFECT]: {
        name: this.props.intl.formatMessage(messages.defect),
        link: this.props.createTabLink(DEFECT),
        component: <DefectTypesTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEFECT_TYPE_TAB,
        mobileDisabled: true,
      },
      [ANALYSIS]: {
        name: this.props.intl.formatMessage(messages.analysis),
        link: this.props.createTabLink(ANALYSIS),
        component: <AutoAnalysisTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_TAB,
        mobileDisabled: true,
      },
      [PATTERN_ANALYSIS]: {
        name: this.props.intl.formatMessage(messages.patternAnalysis),
        link: this.props.createTabLink(PATTERN_ANALYSIS),
        component: <PatternAnalysisTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.PATTERN_ANALYSIS_TAB,
        mobileDisabled: true,
      },
      [DEMO_DATA]: {
        name: this.props.intl.formatMessage(messages.demoData),
        link: this.props.createTabLink(DEMO_DATA),
        component: <DemoDataTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEMO_DATA_TAB,
        mobileDisabled: true,
      },
    };
    if (!canSeeDemoData(this.props.accountRole, this.props.userRole)) {
      delete tabsConfig[DEMO_DATA];
    }
    return { ...tabsConfig, ...this.createExtensionTabs() };
  };

  render() {
    return (
      <div className={cx('settings-page')}>
        <NavigationTabs
          config={this.createTabsConfig()}
          activeTab={this.props.activeTab}
          onChangeTab={this.props.onChangeTab}
        />
      </div>
    );
  }
}
