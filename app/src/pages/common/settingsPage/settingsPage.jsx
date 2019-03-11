import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { canSeeDemoData } from 'common/utils/permissions';
import {
  GENERAL,
  INTEGRATIONS,
  NOTIFICATIONS,
  DEFECT,
  ANALYSIS,
  DEMO_DATA,
} from 'common/constants/settingsTabs';
import { settingsTabSelector } from 'controllers/pages';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { PageLayout, PageHeader } from 'layouts/pageLayout';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { NavigationTabs } from 'components/main/navigationTabs';
import { GeneralTab } from './generalTab';
import { AutoAnalysisTab } from './autoAnalysisTab';
import { NotificationsTab } from './notificationsTab';
import { DemoDataTab } from './demoDataTab';
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
  bts: {
    id: 'SettingsPage.bts',
    defaultMessage: 'Bug tracking system',
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
});

@connect(
  (state) => ({
    activeTab: settingsTabSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
  }),
  {
    changeTab: (link) => redirect(link),
  },
)
@injectIntl
export class SettingsPage extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    createTabLink: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    changeTab: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    breadcrumbs: PropTypes.array,
  };
  static defaultProps = {
    activeTab: GENERAL,
    breadcrumbs: null,
  };

  createTabsConfig = () => {
    const tabsConfig = {
      [GENERAL]: {
        name: this.props.intl.formatMessage(messages.general),
        link: this.props.createTabLink(GENERAL),
        component: <GeneralTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.GENERAL_TAB,
      },
      [INTEGRATIONS]: {
        name: (
          <span>
            {this.props.intl.formatMessage(messages.bts)}
            <BetaBadge className={cx('beta')} />
          </span>
        ),
        link: this.props.createTabLink(INTEGRATIONS),
        component: <div>Integrations</div>,
        eventInfo: SETTINGS_PAGE_EVENTS.INTEGRATIONS_TAB,
      },
      [NOTIFICATIONS]: {
        name: this.props.intl.formatMessage(messages.notifications),
        link: this.props.createTabLink(NOTIFICATIONS),
        component: <NotificationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.NOTIFICATIONS_TAB,
      },
      [DEFECT]: {
        name: this.props.intl.formatMessage(messages.defect),
        link: this.props.createTabLink(DEFECT),
        component: <div>defect</div>,
        eventInfo: SETTINGS_PAGE_EVENTS.DEFECT_TYPE_TAB,
      },
      [ANALYSIS]: {
        name: this.props.intl.formatMessage(messages.analysis),
        link: this.props.createTabLink(ANALYSIS),
        component: <AutoAnalysisTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_TAB,
      },
      [DEMO_DATA]: {
        name: this.props.intl.formatMessage(messages.demoData),
        link: this.props.createTabLink(DEMO_DATA),
        component: <DemoDataTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEMO_DATA_TAB,
      },
    };
    if (!canSeeDemoData(this.props.accountRole, this.props.userRole)) {
      delete tabsConfig[DEMO_DATA];
    }
    return tabsConfig;
  };

  render() {
    return (
      <PageLayout>
        {this.props.breadcrumbs && <PageHeader breadcrumbs={this.props.breadcrumbs} />}
        <div className={cx('settings-page')}>
          <NavigationTabs
            config={this.createTabsConfig()}
            activeTab={this.props.activeTab}
            onChangeTab={this.props.changeTab}
            mobileDisabled
          />
        </div>
      </PageLayout>
    );
  }
}
