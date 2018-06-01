import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';

const messages = defineMessages({
  title: {
    id: 'DeleteNotificationRuleModal.title',
    defaultMessage: 'Delete Notification Rule',
  },
  message: {
    id: 'DeleteNotificationRuleModal.message',
    defaultMessage: 'Are you sure you want to delete notification rule {number}?',
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
        {intl.formatMessage(messages.message, { number: index })}
      </ModalLayout>
    );
  }
}
