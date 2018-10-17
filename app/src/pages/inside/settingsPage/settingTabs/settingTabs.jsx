import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { PROJECT_SETTINGS_TAB_PAGE } from 'controllers/pages';
import { canSeeDemoData } from 'common/utils/permissions';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import {
  GENERAL,
  NOTIFICATIONS,
  BTS,
  DEFECT,
  ANALYSIS,
  DEMO_DATA,
} from 'common/constants/settingTabs';
import {
  activeProjectSelector,
  activeProjectRoleSelector,
  userAccountRoleSelector,
} from 'controllers/user';
import { NavigationTabs } from 'components/main/navigationTabs';
import classNames from 'classnames/bind';
import { BetaBadge } from 'pages/inside/common/betaBadge';
import { GeneralTab } from './generalTab';
import { AutoAnalysisTab } from './autoAnalysisTab';
import { NotificationsTab } from './notificationsTab';
import { DemoDataTab } from './demoDataTab';
import styles from './settingTabs.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  general: {
    id: 'SettingTabs.general',
    defaultMessage: 'General',
  },
  notifications: {
    id: 'SettingTabs.notifications',
    defaultMessage: 'Notifications',
  },
  bts: {
    id: 'SettingTabs.bts',
    defaultMessage: 'Bug tracking system',
  },
  defect: {
    id: 'SettingTabs.defect',
    defaultMessage: 'Defect types',
  },
  analysis: {
    id: 'SettingTabs.analysis',
    defaultMessage: 'Auto-Analysis',
  },
  demoData: {
    id: 'SettingTabs.demoData',
    defaultMessage: 'Demo data',
  },
});

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    activeTab: state.location.payload.settingTab,
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
  }),
  {
    changeTab: (link) => redirect(link),
  },
)
@injectIntl
export class SettingTabs extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    changeTab: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
  };
  static defaultProps = {
    activeTab: GENERAL,
  };

  createTabLink = (tabName) => ({
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { projectId: this.props.projectId, settingTab: tabName },
  });

  createTabsConfig = () => {
    const tabsConfig = {
      general: {
        name: this.props.intl.formatMessage(messages.general),
        link: this.createTabLink(GENERAL),
        component: <GeneralTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.GENERAL_TAB,
      },
      notifications: {
        name: this.props.intl.formatMessage(messages.notifications),
        link: this.createTabLink(NOTIFICATIONS),
        component: <NotificationsTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.NOTIFICATIONS_TAB,
      },
      bts: {
        name: (
          <span>
            {this.props.intl.formatMessage(messages.bts)}
            <BetaBadge className={cx('beta')} />
          </span>
        ),
        link: this.createTabLink(BTS),
        component: <div>bts</div>,
        eventInfo: SETTINGS_PAGE_EVENTS.BTS_TAB,
      },
      defect: {
        name: this.props.intl.formatMessage(messages.defect),
        link: this.createTabLink(DEFECT),
        component: <div>defect</div>,
        eventInfo: SETTINGS_PAGE_EVENTS.DEFECT_TYPE_TAB,
      },
      autoAnalysis: {
        name: this.props.intl.formatMessage(messages.analysis),
        link: this.createTabLink(ANALYSIS),
        component: <AutoAnalysisTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.AUTO_ANALYSIS_TAB,
      },
      demoData: {
        name: this.props.intl.formatMessage(messages.demoData),
        link: this.createTabLink(DEMO_DATA),
        component: <DemoDataTab />,
        eventInfo: SETTINGS_PAGE_EVENTS.DEMO_DATA_TAB,
      },
    };
    if (!canSeeDemoData(this.props.accountRole, this.props.userRole)) {
      delete tabsConfig.demoData;
    }
    return tabsConfig;
  };

  render = () => (
    <div className={cx('settings')}>
      <NavigationTabs
        config={this.createTabsConfig()}
        activeTab={this.props.activeTab || GENERAL}
        onChangeTab={this.props.changeTab}
      />
    </div>
  );
}
