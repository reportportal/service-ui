import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withModal } from 'components/main/modal';
import { submitAddEditDashboardFormAction } from 'controllers/dashboard';
import { AddEditModal } from './addEditModal';
import { DeleteModal } from './deleteModal';

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

  render() {
    const { type } = this.props.data;
    return (
      <Fragment>
        {type === 'delete' ? (
          <DeleteModal {...this.props.data} />
        ) : (
          <AddEditModal
            submitAddEditDashboardForm={this.props.submitAddEditDashboardForm}
            {...this.props.data}
          />
        )}
      </Fragment>
    );
  }
}
