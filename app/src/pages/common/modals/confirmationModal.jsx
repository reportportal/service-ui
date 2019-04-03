import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ModalLayout, withModal } from 'components/main/modal';
import { hideModalAction, confirmModalAction } from 'controllers/modal';

@withModal('confirmationModal')
@connect(null, {
  confirmModal: confirmModalAction,
  hideModal: hideModalAction,
})
export class ConfirmationModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    confirmModal: PropTypes.func.isRequired,
    hideModal: PropTypes.func.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const { message, onConfirm, title, confirmText, cancelText } = this.props.data;
    const { confirmModal, hideModal } = this.props;
    return (
      <ModalLayout
        title={title}
        okButton={{
          text: confirmText,
          onClick: (closeModal) => {
            confirmModal();
            closeModal();
            onConfirm();
            hideModal();
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
