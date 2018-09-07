import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { addDashboardAction } from 'controllers/dashboard';
import { showModalAction } from 'controllers/modal';
import AddDashboardIcon from './img/ic-add-dash-inline.svg';
import styles from './addDashboardButton.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  addModalTitle: {
    id: 'DashboardForm.addModalTitle',
    defaultMessage: 'Add New Dashboard',
  },
});

@connect(null, {
  showModal: showModalAction,
  addDashboard: addDashboardAction,
})
@injectIntl
export class AddDashboardButton extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModal: PropTypes.func,
    addDashboard: PropTypes.func,
  };

  static defaultProps = {
    showModal: () => {},
    addDashboard: () => {},
  };

  onAddDashboardItem = () => {
    const { showModal, addDashboard } = this.props;

    showModal({
      id: 'dashboardAddEditModal',
      data: {
        onSubmit: addDashboard,
        type: 'add',
      },
    });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('add-dashboard-btn')}>
        <GhostButton onClick={this.onAddDashboardItem} icon={AddDashboardIcon}>
          {intl.formatMessage(messages.addModalTitle)}
        </GhostButton>
      </div>
    );
  }
}
