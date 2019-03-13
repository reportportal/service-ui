import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
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
    defaultMessage: "The project '{name}' was successfully created",
  },
  projectExists: {
    id: 'ProjectsPage.projectExists',
    defaultMessage: "The project '{name}' is already exists",
  },
  returnToGlobalSuccess: {
    id: 'InstancesSection.returnToGlobalSuccess',
    defaultMessage: 'Global integrations successfully applied',
  },
  addIntegrationSuccess: {
    id: 'InstancesSection.addIntegrationSuccess',
    defaultMessage: 'Integration successfully added',
  },
  updateIntegrationSuccess: {
    id: 'IntegrationSettingsContainer.updateIntegrationSuccess',
    defaultMessage: 'Integration successfully updated',
  },
  removeIntegrationSuccess: {
    id: 'ConnectionSection.removeIntegrationSuccess',
    defaultMessage: 'Integration successfully deleted',
  },
});

@injectIntl
export class NotificationItem extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
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
