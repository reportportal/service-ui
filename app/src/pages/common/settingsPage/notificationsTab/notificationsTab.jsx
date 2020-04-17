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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import track from 'react-tracking';
import { injectIntl } from 'react-intl';
import { formatAttribute } from 'common/utils/attributeUtils';
import { canUpdateSettings } from 'common/utils/permissions';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import {
  updateProjectNotificationsConfigAction,
  projectNotificationsCasesSelector,
  projectNotificationsEnabledSelector,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { NoCasesBlock } from 'components/main/noCasesBlock';
import styles from './notificationsTab.scss';
import { RuleListHeader } from '../ruleListHeader';
import { RuleList } from '../ruleList';
import {
  ATTRIBUTES_FIELD_KEY,
  DEFAULT_CASE_CONFIG,
  LAUNCH_NAMES_FIELD_KEY,
  RECIPIENTS_FIELD_KEY,
  SEND_CASE_FIELD_KEY,
} from './constants';
import { convertNotificationCaseForSubmission } from './utils';
import { messages } from './messages';

const cx = classNames.bind(styles);
const ruleFieldsConfig = {
  [RECIPIENTS_FIELD_KEY]: {
    title: messages.recipientsLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [SEND_CASE_FIELD_KEY]: {
    title: messages.inCaseLabel,
    dataFormatter: (data, formatMessage) =>
      messages[data] ? formatMessage(messages[data]) : messages[data],
  },
  [LAUNCH_NAMES_FIELD_KEY]: {
    title: messages.launchNamesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${item}`, ''),
  },
  [ATTRIBUTES_FIELD_KEY]: {
    title: messages.attributesLabel,
    dataFormatter: (data) =>
      data.reduce((acc, item) => `${acc.length ? `${acc}, ` : ''}${formatAttribute(item)}`, ''),
  },
};

@injectIntl
@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    enabled: projectNotificationsEnabledSelector(state),
    cases: projectNotificationsCasesSelector(state),
    isEmailIntegrationAvailable: isEmailIntegrationAvailableSelector(state),
  }),
  {
    updateNotificationsConfig: updateProjectNotificationsConfigAction,
    showModal: showModalAction,
  },
)
@track()
export class NotificationsTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    enabled: PropTypes.bool,
    cases: PropTypes.array,
    updateNotificationsConfig: PropTypes.func,
    showModal: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
    isEmailIntegrationAvailable: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    enabled: false,
    cases: [],
    showModal: () => {},
    updateNotificationsConfig: () => {},
    projectRole: '',
    userRole: '',
    isEmailIntegrationAvailable: true,
  };

  isAbleToEditNotificationCaseList = () =>
    canUpdateSettings(this.props.userRole, this.props.projectRole);

  isAbleToEditNotificationsEnableForm = () =>
    canUpdateSettings(this.props.userRole, this.props.projectRole) &&
    this.props.isEmailIntegrationAvailable;

  toggleNotificationsEnabled = (enabled) => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_INPUT_NOTIFICATIONS);
    this.props.updateNotificationsConfig({ enabled });
  };

  confirmAddCase = (notificationCase) => {
    const { cases: oldCases, updateNotificationsConfig } = this.props;
    const cases = [...oldCases, notificationCase].map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases });
  };

  confirmEditCase = (id, notificationCase) => {
    const { cases: oldCases, updateNotificationsConfig } = this.props;
    const updatedCases = [...oldCases];
    updatedCases.splice(id, 1, notificationCase);
    const cases = updatedCases.map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases });
  };

  confirmDeleteCase = (id) => {
    const { cases: oldCases, updateNotificationsConfig } = this.props;
    const cases = oldCases
      .filter((item, index) => index !== id)
      .map(convertNotificationCaseForSubmission);
    updateNotificationsConfig({ cases });
  };

  addNotificationCase = () => {
    const { showModal } = this.props;
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    showModal({
      id: 'addEditNotificationCaseModal',
      data: {
        onConfirm: this.confirmAddCase,
        notificationCase: DEFAULT_CASE_CONFIG,
        isNewCase: true,
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_ADD_RULE_NOTIFICATIONS,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_ADD_RULE_NOTIFICATIONS,
          saveBtn: SETTINGS_PAGE_EVENTS.SAVE_ADD_RULE_NOTIFICATIONS,
        },
      },
    });
  };

  onEdit = (notificationCase, id) => {
    const { showModal, tracking } = this.props;

    tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RULE_NOTIFICATIONS);
    showModal({
      id: 'addEditNotificationCaseModal',
      data: {
        onConfirm: (data) => this.confirmEditCase(id, data),
        notificationCase,
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_EDIT_RULE_NOTIFICATIONS,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_EDIT_RULE_NOTIFICATIONS,
          saveBtn: SETTINGS_PAGE_EVENTS.SAVE_EDIT_RULE_NOTIFICATIONS,
        },
      },
    });
  };

  onDelete = (notificationCase, id) => {
    const { showModal, tracking } = this.props;

    tracking.trackEvent(SETTINGS_PAGE_EVENTS.CLICK_ON_DELETE_RULE_NOTIFICATIONS);
    showModal({
      id: 'deleteNotificationCaseModal',
      data: {
        id,
        onConfirm: () => this.confirmDeleteCase(id),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_RULE_NOTIFICATIONS,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_DELETE_RULE_NOTIFICATIONS,
          deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_RULE_NOTIFICATIONS,
        },
      },
    });
  };

  onToggleHandler = (enabled, notificationCase, id) => {
    const { cases: oldCases, updateNotificationsConfig, tracking } = this.props;
    const updatedCases = [...oldCases];
    updatedCases.splice(id, 1, { ...notificationCase, enabled });
    const cases = updatedCases.map(convertNotificationCaseForSubmission);

    tracking.trackEvent(
      enabled
        ? SETTINGS_PAGE_EVENTS.TURN_ON_NOTIFICATION_RULE_SWITCHER
        : SETTINGS_PAGE_EVENTS.TURN_OFF_NOTIFICATION_RULE_SWITCHER,
    );
    updateNotificationsConfig({ cases });
  };

  getPanelTitle = () => this.props.intl.formatMessage(messages.controlPanelName);

  getListItemContentData = (notificationCase) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const notification = convertNotificationCaseForSubmission(notificationCase);

    return Object.keys(notification)
      .map((fieldKey) => {
        const fieldInfo = ruleFieldsConfig[fieldKey];
        const fieldData = notification[fieldKey];

        return {
          key: fieldInfo ? formatMessage(fieldInfo.title) : null,
          value: fieldInfo && fieldData ? fieldInfo.dataFormatter(fieldData, formatMessage) : null,
        };
      })
      .filter((item) => item.key && item.value);
  };

  render() {
    const { enabled, cases, intl, isEmailIntegrationAvailable } = this.props;
    const readOnlyNotificationsEnableForm = !this.isAbleToEditNotificationsEnableForm();
    const readOnlyNotificationCaseList = !this.isAbleToEditNotificationCaseList();
    const titleMessage = !isEmailIntegrationAvailable ? intl.formatMessage(messages.title) : '';

    return (
      <div className={cx('notifications-tab')}>
        {cases.length ? (
          <Fragment>
            <RuleListHeader
              readOnly={readOnlyNotificationsEnableForm}
              messages={messages}
              switcherValue={enabled}
              titleMessage={titleMessage}
              onAddItem={this.addNotificationCase}
              onChangeSwitcher={this.toggleNotificationsEnabled}
            />
            <RuleList
              readOnly={readOnlyNotificationCaseList}
              data={cases}
              onToggle={this.onToggleHandler}
              onDelete={this.onDelete}
              onEdit={this.onEdit}
              getPanelTitle={this.getPanelTitle}
              getListItemContentData={this.getListItemContentData}
              messages={messages}
            />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <GhostButton
              mobileDisabled
              disabled={readOnlyNotificationCaseList}
              icon={PlusIcon}
              onClick={this.addNotificationCase}
            >
              {intl.formatMessage(messages.create)}
            </GhostButton>
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
