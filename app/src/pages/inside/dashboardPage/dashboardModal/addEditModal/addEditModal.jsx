import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ModalLayout, withModal } from 'components/main/modal';
import { DashboardForm } from 'pages/inside/dashboardPage/dashboardModal/dashboardForm';
import { connect } from 'react-redux';
import { submitAddEditDashboardFormAction } from 'controllers/dashboard';

@withModal('dashboardAddEditModal')
@connect(null, {
  submitAddEditDashboardForm: submitAddEditDashboardFormAction,
})
export class AddEditModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    submitAddEditDashboardForm: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    submitAddEditDashboardForm: () => {},
  };

  render() {
    const { dashboardItem, submitText, title, onSubmit, cancelText } = this.props.data;
    const { submitAddEditDashboardForm } = this.props;

    return (
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
        <DashboardForm dashboardItem={dashboardItem} onSubmit={onSubmit} />
      </ModalLayout>
    );
  }
}
