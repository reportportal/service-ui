import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ModalLayout, withModal } from 'components/main/modal';

@withModal('dashboardDeleteModal')
export class DeleteModal extends Component {
  static propTypes = {
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const {
      message,
      dashboardItem,
      onSubmit,
      isCurrentUser,
      title,
      submitText,
      warningMessage,
      cancelText,
    } = this.props.data;
    const warning = isCurrentUser ? '' : warningMessage;

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          danger: true,
          onClick: (closeModal) => {
            closeModal();
            onSubmit(dashboardItem);
          },
        }}
        cancelButton={{
          text: cancelText,
        }}
        warningMessage={warning}
      >
        <div>{message}</div>
      </ModalLayout>
    );
  }
}
