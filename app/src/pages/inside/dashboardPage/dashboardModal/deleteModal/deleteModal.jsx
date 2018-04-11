import React from 'react';
import PropTypes from 'prop-types';
import { ModalLayout } from 'components/main/modal';

export const DeleteModal = ({
  message,
  dashboardItem,
  onSubmit,
  isCurrentUser,
  title,
  submitText,
  warningMessage,
  cancelText,
}) => {
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
};

DeleteModal.propTypes = {
  message: PropTypes.string,
  dashboardItem: PropTypes.object,
  onSubmit: PropTypes.func,
  isCurrentUser: PropTypes.bool,
  title: PropTypes.string,
  submitText: PropTypes.string,
  warningMessage: PropTypes.string,
  cancelText: PropTypes.string,
};

DeleteModal.defaultProps = {
  message: '',
  dashboardItem: {},
  onSubmit: () => {},
  isCurrentUser: false,
  title: '',
  submitText: '',
  warningMessage: '',
  cancelText: '',
};
