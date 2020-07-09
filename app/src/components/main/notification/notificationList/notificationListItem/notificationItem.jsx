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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import styles from './notificationItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  successLogin: { id: 'NotificationItem.successLogin', defaultMessage: 'Signed in successfully' },
  failureDefault: {
    id: 'NotificationItem.failureDefault',
    defaultMessage: 'An error occurred while connecting to server: {error}',
  },
  infoLogout: { id: 'NotificationItem.infoLogout', defaultMessage: 'You have been logged out' },
  assignSuccess: {
    id: 'ProjectsPage.assignSuccess',
    defaultMessage: 'You have been assigned to the project',
  },
  assignError: {
    id: 'ProjectsPage.assignError',
    defaultMessage: 'An error occurred during assigning to the project',
  },
  unassignSuccess: {
    id: 'ProjectsPage.unassignSuccess',
    defaultMessage: 'You have been unassigned from the project',
  },
  unassignError: {
    id: 'ProjectsPage.unassignError',
    defaultMessage: 'An error occurred during unassigning from the project',
  },
  deleteError: {
    id: 'ProjectsPage.deleteError',
    defaultMessage: 'An error occurred during deleting the project',
  },
  updateDefectSubTypeSuccess: {
    id: 'Project.updateDefectSubTypeSuccess',
    defaultMessage: 'Completed successfully!',
  },
  deleteDefectSubTypeSuccess: {
    id: 'Project.deleteDefectSubTypeSuccess',
    defaultMessage: 'Defect type was successfully deleted',
  },
  updateProjectNotificationsConfigurationSuccess: {
    id: 'NotificationsTab.updateProjectNotificationsConfigurationSuccess',
    defaultMessage: 'Notification settings were successfully updated!',
  },
  addProjectSuccess: {
    id: 'ProjectsPage.addProjectSuccess',
    defaultMessage: "The project ''{name}'' was successfully created",
  },
  projectExists: {
    id: 'ProjectsPage.projectExists',
    defaultMessage: "The project ''{name}'' is already exists",
  },
  resetToGlobalSuccess: {
    id: 'InstancesSection.resetToGlobalSuccess',
    defaultMessage: 'Global integrations successfully applied',
  },
  addIntegrationSuccess: {
    id: 'InstancesSection.addIntegrationSuccess',
    defaultMessage: 'Integration successfully added',
  },
  removePluginSuccess: {
    id: 'InstancesSection.removePluginSuccess',
    defaultMessage: 'Plugin has been uninstalled successfully',
  },
  updateIntegrationSuccess: {
    id: 'IntegrationSettingsContainer.updateIntegrationSuccess',
    defaultMessage: 'Integration successfully updated',
  },
  removeIntegrationSuccess: {
    id: 'ConnectionSection.removeIntegrationSuccess',
    defaultMessage: 'Integration successfully deleted',
  },
  addDashboardSuccess: {
    id: 'DashboardPage.addDashboardSuccess',
    defaultMessage: 'Dashboard has been added',
  },
  deleteDashboardSuccess: {
    id: 'DashboardPage.deleteDashboardSuccess',
    defaultMessage: 'Dashboard has been deleted',
  },
  addPatternSuccess: {
    id: 'PatternAnalysis.addPatternSuccess',
    defaultMessage: 'Pattern rule has been created',
  },
  updatePatternSuccess: {
    id: 'PatternAnalysis.updatePatternSuccess',
    defaultMessage: 'Pattern rule updated successfully',
  },
  deletePatternSuccess: {
    id: 'PatternAnalysis.deletePatternSuccess',
    defaultMessage: 'Pattern rule deleted successfully',
  },
  updatePAStateSuccess: {
    id: 'PatternAnalysis.updatePAStateSuccess',
    defaultMessage: 'Pattern analysis settings were successfully updated',
  },
  saveFilterSuccess: {
    id: 'LaunchFiltersToolbar.saveFilterSuccess',
    defaultMessage: 'Filter has been saved',
  },
  updateFilterSuccess: {
    id: 'LaunchFiltersToolbar.updateFilterSuccess',
    defaultMessage: 'Filter has been updated',
  },
  deleteTestItemSuccess: {
    id: 'TestItemsPage.success',
    defaultMessage: 'Item was deleted',
  },
  deleteTestItemMultipleSuccess: {
    id: 'TestItemsPage.successMultiple',
    defaultMessage: 'Items were deleted',
  },
});

@injectIntl
export class NotificationItem extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    uid: PropTypes.number.isRequired,
    onMessageClick: PropTypes.func.isRequired,
    message: PropTypes.string,
    messageId: PropTypes.string,
    type: PropTypes.oneOf([
      NOTIFICATION_TYPES.ERROR,
      NOTIFICATION_TYPES.INFO,
      NOTIFICATION_TYPES.SUCCESS,
    ]),
    values: PropTypes.object,
  };
  static defaultProps = {
    message: '',
    messageId: '',
    type: NOTIFICATION_TYPES.INFO,
    values: {},
  };

  messageClick = () => {
    this.props.onMessageClick(this.props.uid);
  };

  render() {
    const {
      intl: { formatMessage },
      message,
      type,
      messageId,
      values,
    } = this.props;

    if (message === '' && messageId === '') {
      return null;
    }
    return (
      <div key={message} onClick={this.messageClick}>
        <div className={cx('message-container', type)}>
          <p>{Parser(messageId ? formatMessage(messages[messageId], values) : message)}</p>
        </div>
      </div>
    );
  }
}
