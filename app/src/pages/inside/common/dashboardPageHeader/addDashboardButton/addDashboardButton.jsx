import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { GhostButton } from 'components/buttons/ghostButton';
import { addDashboardAction } from 'controllers/dashboard';
import { showModalAction } from 'controllers/modal';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
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
@track()
export class AddDashboardButton extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    showModal: PropTypes.func,
    addDashboard: PropTypes.func,
    eventsInfo: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    showModal: () => {},
    addDashboard: () => {},
    eventsInfo: {},
  };

  onAddDashboardItem = () => {
    const { showModal, addDashboard, eventsInfo, tracking } = this.props;
    tracking.trackEvent(DASHBOARD_PAGE_EVENTS.ADD_NEW_DASHBOARD_BTN);
    showModal({
      id: 'dashboardAddEditModal',
      data: {
        onSubmit: addDashboard,
        type: 'add',
        eventsInfo,
      },
    });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('add-dashboard-btn')}>
        <GhostButton onClick={this.onAddDashboardItem} icon={AddDashboardIcon} transparentBorder>
          {intl.formatMessage(messages.addModalTitle)}
        </GhostButton>
      </div>
    );
  }
}
