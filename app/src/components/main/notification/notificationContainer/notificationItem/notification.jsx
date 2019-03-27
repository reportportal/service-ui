import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import styles from './notification.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  successLogin: { id: 'Notification.successLogin', defaultMessage: 'Signed in successfully' },
  failureDefault: {
    id: 'Notification.failureDefault',
    defaultMessage: 'An error occurred while connecting to server: {error}',
  },
  infoLogout: { id: 'Notification.infoLogout', defaultMessage: 'You have been logged out' },
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
});

@injectIntl
export class Notification extends PureComponent {
  static propTypes = {
    message: PropTypes.string,
    messageId: PropTypes.string,
    type: PropTypes.oneOf([
      NOTIFICATION_TYPES.ERROR,
      NOTIFICATION_TYPES.INFO,
      NOTIFICATION_TYPES.SUCCESS,
    ]),
    values: PropTypes.object,
    uid: PropTypes.number.isRequired,
    onMessageClick: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
    const { message, type, messageId, intl, values } = this.props;
    if (message === '' && messageId === '') {
      return null;
    }
    return (
      <div key={message} onClick={this.messageClick}>
        <div className={cx('message-container', type)}>
          <p> {messageId ? intl.formatMessage(messages[messageId], values) : message}</p>
        </div>
      </div>
    );
  }
}
