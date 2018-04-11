import React from 'react';
import PropTypes from 'prop-types';
import { ModalLayout } from 'components/main/modal';
import { DashboardForm } from 'pages/inside/dashboardPage/dashboardModal/dashboardForm';

export const AddEditModal = ({
  dashboardItem,
  submitText,
  title,
  onSubmit,
  cancelText,
  submitAddEditDashboardForm,
}) => (
  <ModalLayout
    title={title}
    okButton={{
      text: submitText,
      onClick: (closeModal) => {
        closeModal();
        submitAddEditDashboardForm();
      },
    }}
    cancelButton={{
      text: cancelText,
    }}
  >
    <DashboardForm
      dashboardItem={dashboardItem}
      onSubmit={(e) => {
        onSubmit(e);
      }}
    />
  </ModalLayout>
);

AddEditModal.propTypes = {
  dashboardItem: PropTypes.object,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  submitAddEditDashboardForm: PropTypes.func,
};

AddEditModal.defaultProps = {
  dashboardItem: {},
  onSubmit: () => {},
  title: '',
  submitText: '',
  cancelText: '',
  submitAddEditDashboardForm: () => {},
};
