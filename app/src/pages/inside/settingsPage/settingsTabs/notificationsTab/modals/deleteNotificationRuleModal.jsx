import React, { Component } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { ModalLayout, withModal } from 'components/main/modal';
import styles from './deleteNotificationRuleModal.scss';

const cx = className.bind(styles);

const messages = defineMessages({
  title: {
    id: 'DeleteNotificationRuleModal.title',
    defaultMessage: 'Delete Notification Rule',
  },
  message: {
    id: 'DeleteNotificationRuleModal.message',
    defaultMessage: 'Are you sure you want to delete notification  rule <b>{number}</b>?',
  },
  submitButton: {
    id: 'DeleteNotificationRuleModal.submitButton',
    defaultMessage: 'Delete',
  },
  cancelButton: {
    id: 'DeleteNotificationRuleModal.cancelButton',
    defaultMessage: 'Cancel',
  },
});

@withModal('deleteNotificationRuleModal')
@injectIntl
export class DeleteNotificationRuleModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object,
  };
  static defaultProps = {
    data: {},
  };
  render() {
    const {
      intl,
      data: { index, onSubmit },
    } = this.props;
    return (
      <ModalLayout
        title={intl.formatMessage(messages.title)}
        okButton={{
          text: intl.formatMessage(messages.submitButton),
          danger: true,
          onClick: (closeModal) => {
            onSubmit();
            closeModal();
          },
        }}
        cancelButton={{
          text: intl.formatMessage(messages.cancelButton),
        }}
      >
        <div className={cx('message')}>
          {Parser(intl.formatMessage(messages.message, { number: index }))}
        </div>
      </ModalLayout>
    );
  }
}
