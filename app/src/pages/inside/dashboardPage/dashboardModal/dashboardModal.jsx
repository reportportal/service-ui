import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withModal, ModalLayout } from 'components/main/modal';
import { submitAddEditDashboardFormAction } from 'controllers/dashboard';
import { DashboardForm } from './dashboardForm';

@withModal('dashboardModal')
@connect(null, {
  submitAddEditDashboardForm: submitAddEditDashboardFormAction,
})
export class DashboardModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    submitAddEditDashboardForm: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    submitAddEditDashboardForm: () => {},
  };

  renderDeleteModal() {
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
        <div>
          {message}
        </div>
      </ModalLayout>);
  }

  renderConfigureModal() {
    const { submitAddEditDashboardForm } = this.props;
    const {
      dashboardItem = {},
      submitText,
      title,
      onSubmit,
      cancelText,
    } = this.props.data;

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
        <DashboardForm
          dashboardItem={dashboardItem}
          onSubmit={(e) => {
            onSubmit(e);
          }}
        />
      </ModalLayout>
    );
  }

  render() {
    const { type } = this.props.data;
    return (
      <Fragment>
        {
          type === 'delete' ?
            this.renderDeleteModal()
            :
            this.renderConfigureModal()
        }
      </Fragment>
    );
  }
}
