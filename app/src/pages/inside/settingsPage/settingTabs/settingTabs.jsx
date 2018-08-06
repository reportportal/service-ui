import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redirect } from 'redux-first-router';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { PROJECT_SETTINGS_TAB_PAGE } from 'controllers/pages';
import {
  GENERAL,
  NOTIFICATIONS,
  BTS,
  DEFECT,
  ANALYSIS,
  DEMO_DATA,
} from 'common/constants/settingTabs';
import { activeProjectSelector } from 'controllers/user';
import { NavigationTabs } from 'components/main/navigationTabs';
import classNames from 'classnames/bind';
import { GeneralTab } from './generalTab';
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
  beta: {
    id: 'SettingTabs.beta',
    defaultMessage: 'beta',
  },
});

@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    activeTab: state.location.payload.settingTab,
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
  };
  static defaultProps = {
    activeTab: GENERAL,
  };

  createTabLink = (tabName) => ({
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { projectId: this.props.projectId, settingTab: tabName },
  });

  tabsConfig = {
    general: {
      name: this.props.intl.formatMessage(messages.general),
      link: this.createTabLink(GENERAL),
      component: <GeneralTab />,
    },
    notifications: {
      name: this.props.intl.formatMessage(messages.notifications),
      link: this.createTabLink(NOTIFICATIONS),
      component: <div>notification</div>,
    },
    bts: {
      name: (
        <span>
          {this.props.intl.formatMessage(messages.bts)}
          <span className={cx('beta')}>{this.props.intl.formatMessage(messages.beta)}</span>
        </span>
      ),
      link: this.createTabLink(BTS),
      component: <div>bts</div>,
    },
    defect: {
      name: this.props.intl.formatMessage(messages.defect),
      link: this.createTabLink(DEFECT),
      component: <div>defect</div>,
    },
    autoAnalysis: {
      name: this.props.intl.formatMessage(messages.analysis),
      link: this.createTabLink(ANALYSIS),
      component: <div>autoAnalysis</div>,
    },
    demoData: {
      name: this.props.intl.formatMessage(messages.demoData),
      link: this.createTabLink(DEMO_DATA),
      component: <div>demo</div>,
    },
  };

  render = () => (
    <div className={cx('settings')}>
      <NavigationTabs
        config={this.tabsConfig}
        activeTab={this.props.activeTab || GENERAL}
        onChangeTab={this.props.changeTab}
      />
    </div>
  );
}
