import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ModalLayout, withModal } from 'components/main/modal';
import { confirmModalAction } from 'controllers/modal';

@withModal('confirmationModal')
@connect(null, {
  confirmModal: confirmModalAction,
})
export class ConfirmationModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    confirmModal: PropTypes.func.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { message, onConfirm, title, confirmText, cancelText } = this.props.data;
    const { confirmModal } = this.props;
    return (
      <ModalLayout
        title={title}
        okButton={{
          text: confirmText,
          onClick: (closeModal) => {
            confirmModal();
            closeModal();
            onConfirm();
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
      >
        <div>{message}</div>
      </ModalLayout>
    );
  }
}
