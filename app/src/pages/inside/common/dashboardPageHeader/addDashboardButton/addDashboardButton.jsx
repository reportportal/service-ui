/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
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
    intl: PropTypes.object.isRequired,
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
        <GhostButton onClick={this.onAddDashboardItem} icon={AddDashboardIcon}>
          {intl.formatMessage(messages.addModalTitle)}
        </GhostButton>
      </div>
    );
  }
}
