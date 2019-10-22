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
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { canConfigreEmailNotifications } from 'common/utils/permissions';
import {
  updateProjectNotificationsConfigAction,
  projectNotificationsCasesSelector,
  projectNotificationsEnabledSelector,
} from 'controllers/project';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { NotificationsEnableForm } from './notificationsEnableForm';
import { NotificationCaseList } from './notificationCaseList';
import { NoCasesBlock } from './../noCasesBlock';
import { AddNewCaseButton } from './addNewCaseButton';
import styles from './notificationsTab.scss';

const messages = defineMessages({
  noItemsMessage: {
    id: 'NoCasesBlock.noItemsMessage',
    defaultMessage: 'No Email Notification Rules',
  },
  notificationsInfo: {
    id: 'NoCasesBlock.notificationsInfo',
    defaultMessage: 'After launches finish, system will notify selected people by email.',
  },
});

const cx = classNames.bind(styles);
@injectIntl
@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    userRole: userAccountRoleSelector(state),
    enabled: projectNotificationsEnabledSelector(state),
    cases: projectNotificationsCasesSelector(state),
    isEmailIntegrationAvailable: isEmailIntegrationAvailableSelector(state),
  }),
  { updateNotificationsConfig: updateProjectNotificationsConfigAction },
)
export class NotificationsTab extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    enabled: PropTypes.bool,
    cases: PropTypes.array,
    updateNotificationsConfig: PropTypes.func,
    projectRole: PropTypes.string,
    userRole: PropTypes.string,
    isEmailIntegrationAvailable: PropTypes.bool,
  };
  static defaultProps = {
    enabled: false,
    cases: [],
    updateNotificationsConfig: () => {},
    projectRole: '',
    userRole: '',
    isEmailIntegrationAvailable: true,
  };

  isAbleToEditNotificationCaseList = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole);

  isAbleToEditNotificationsEnableForm = () =>
    canConfigreEmailNotifications(this.props.userRole, this.props.projectRole) &&
    this.props.isEmailIntegrationAvailable;

  toggleNotificationsEnabled = ({ enabled } = {}, dispatch, formProps) =>
    formProps.dirty && this.props.updateNotificationsConfig({ enabled });

  render() {
    const {
      enabled,
      cases,
      updateNotificationsConfig,
      intl,
      isEmailIntegrationAvailable,
    } = this.props;
    const readOnlyNotificationsEnableForm = !this.isAbleToEditNotificationsEnableForm();
    const readOnlyNotificationCaseList = !this.isAbleToEditNotificationCaseList();

    return (
      <div className={cx('notifications-tab')}>
        {cases.length ? (
          <Fragment>
            <NotificationsEnableForm
              initialValues={{ enabled }}
              onChange={this.toggleNotificationsEnabled}
              readOnly={readOnlyNotificationsEnableForm}
              isEmailIntegrationAvailable={isEmailIntegrationAvailable}
            />
            <NotificationCaseList
              updateNotificationCases={updateNotificationsConfig}
              cases={cases}
              readOnly={readOnlyNotificationCaseList}
            />
          </Fragment>
        ) : (
          <NoCasesBlock
            noItemsMessage={intl.formatMessage(messages.noItemsMessage)}
            notificationsInfo={intl.formatMessage(messages.notificationsInfo)}
          >
            <AddNewCaseButton
              updateNotificationCases={updateNotificationsConfig}
              disabled={readOnlyNotificationCaseList}
            />
          </NoCasesBlock>
        )}
      </div>
    );
  }
}
