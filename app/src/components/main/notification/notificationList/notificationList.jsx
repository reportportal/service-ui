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
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { hideNotification } from 'controllers/notification';
import { SystemAlert } from '@reportportal/ui-kit';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './notificationList.scss';

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
  addDefectTypeSuccess: {
    id: 'Project.addDefectTypeSuccess',
    defaultMessage: 'Defect Type has been successfully created',
  },
  updateDefectTypeSuccess: {
    id: 'Project.updateDefectTypeSuccess',
    defaultMessage: 'Defect Type has been successfully updated',
  },
  deleteDefectTypeSuccess: {
    id: 'Project.deleteDefectTypeSuccess',
    defaultMessage: 'Defect Type has been deleted successfully',
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
    defaultMessage: 'Dashboard has been created successfully.',
  },
  updateDashboardSuccess: {
    id: 'DashboardPage.updateDashboardSuccess',
    defaultMessage: 'Dashboard has been updated successfully',
  },
  deleteDashboardSuccess: {
    id: 'DashboardPage.deleteDashboardSuccess',
    defaultMessage: 'Dashboard has been deleted',
  },
  addPreconfigDashboardError: {
    id: 'DashboardPage.addPreconfigDashboardError',
    defaultMessage: "Dashboard can't be created. Please check the pasted configuration.",
  },
  duplicateDashboardSuccess: {
    id: 'Notifications.duplicateDashboardSuccess',
    defaultMessage: 'Dashboard has been duplicated successfully',
  },
  dashboardConfigurationCopied: {
    id: 'Notifications.dashboardConfigurationCopied',
    defaultMessage: 'Dashboard configuration has been copied to clipboard successfully',
  },
  dashboardExists: {
    id: 'DashboardPage.dashboardExists',
    defaultMessage: "Dashboard with the same name ''{name}'' already exists on the project",
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
  fetchApiKeysError: {
    id: 'ProfilePage.apiKeys.fetchApiKeysError',
    defaultMessage: 'An error occurred during fetch API keys',
  },
  loadedItemsWithDisplayedLaunches: {
    id: 'TestCaseSearch.loadedItemsWithDisplayedLaunches',
    defaultMessage:
      "Loaded tests are grouped under the launches due to the active 'Display launches' toggle.",
  },
  updateSessionExpirationSuccess: {
    id: 'ProfilePage.updateSessionExpirationSuccess',
    defaultMessage: 'Session inactivity timeout has been changed successfully',
  },
});

@injectIntl
@connect(
  (state) => ({
    notifications: state.notifications,
  }),
  {
    hideNotification,
  },
)
export class NotificationList extends PureComponent {
  static propTypes = {
    notifications: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideNotification: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
  };

  render() {
    const { formatMessage } = this.props.intl;
    return (
      <div className={cx('notification-list')} data-automation-id="notificationsContainer">
        <TransitionGroup>
          {this.props.notifications.map(({ uid, type, messageId, values, message }) => (
            <CSSTransition key={uid} timeout={1000} classNames="notification-transition">
              <div className={cx('notification-item-wrapper')}>
                <SystemAlert
                  type={type}
                  title={Parser(
                    DOMPurify.sanitize(
                      messageId ? formatMessage(messages[messageId], values) : message,
                    ),
                  )}
                  onClose={() => this.props.hideNotification(uid)}
                  className={cx('notification-item')}
                  dataAutomationId="notificationItem"
                />
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    );
  }
}
