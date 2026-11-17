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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Parser from 'html-react-parser';
import track from 'react-tracking';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { PASSED, FAILED, SKIPPED, ALL_STATUSES, WARN, INFO } from 'common/constants/testStatuses';
import { formatStatus } from 'common/utils/localizationUtils';
import ArrowIcon from 'common/img/arrow-down-inline.svg';

import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './logStatusBlock.scss';

const messages = defineMessages({
  [`status${PASSED}`]: {
    id: 'LogStatusBlock.statusPassed',
    defaultMessage: 'Passed',
  },
  [`status${FAILED}`]: {
    id: 'LogStatusBlock.statusFailed',
    defaultMessage: 'Failed',
  },
  [`status${SKIPPED}`]: {
    id: 'LogStatusBlock.statusSkipped',
    defaultMessage: 'Skipped',
  },
  [`status${ALL_STATUSES}`]: {
    id: 'LogStatusBlock.statusLabel',
    defaultMessage: 'All statuses',
  },
  statusAllLabel: {
    id: 'LogStatusBlock.statusAllLabel',
    defaultMessage: 'ALL',
  },
});

const cx = classNames.bind(styles);

@injectIntl
@track()
export class LogStatusBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onChangeLogStatusFilter: PropTypes.func.isRequired,
    logStatus: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    logStatus: null,
  };

  state = {
    opened: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  getLogStatusArray = () => {
    const { logStatus } = this.props;
    return logStatus ? logStatus.split(',') : [];
  };

  getStatusLabel = () => {
    const activeStatuses = this.getLogStatusArray();

    if (!activeStatuses.length || this.getIsAllStatusesActive(activeStatuses)) {
      return this.formatStatus(ALL_STATUSES).toUpperCase();
    }

    return activeStatuses.map(this.formatStatus).join(', ').toUpperCase();
  };

  getIsAllStatusesActive = (activeStatuses) => activeStatuses.length === this.statusArray.length;

  formatStatus = (status) =>
    messages[`status${status}`]
      ? this.props.intl.formatMessage(messages[`status${status}`])
      : formatStatus(this.props.intl.formatMessage, status);

  node = React.createRef();

  statusArray = [PASSED, FAILED, SKIPPED, WARN, INFO];

  toggleDropdown = () => {
    this.setState((prevState) => {
      const isOpened = !prevState.opened;

      if (isOpened) {
        this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ALL_STATUSES_DROPDOWN.OPEN);
      }

      return {
        opened: isOpened,
      };
    });
  };

  toggleCheckbox = (value) => {
    const activeStatuses = this.getLogStatusArray();
    const newActiveStatuses = this.isCheckboxActive(value)
      ? activeStatuses.filter((status) => status !== value)
      : [...activeStatuses, value];

    this.handleStatusChange(newActiveStatuses);
  };

  toggleAll = () => {
    const activeStatuses = this.getLogStatusArray();
    const newActiveStatuses = this.getIsAllStatusesActive(activeStatuses)
      ? []
      : [...this.statusArray];

    this.handleStatusChange(newActiveStatuses);
  };

  handleStatusChange = (activeStatuses) => {
    const isSomeActive = !!activeStatuses.length;
    let logTrackingStatus;

    if (this.getIsAllStatusesActive(activeStatuses)) {
      logTrackingStatus = 'all';
    } else if (isSomeActive) {
      logTrackingStatus = activeStatuses.map((status) => status.toLowerCase()).join('#');
    }

    if (logTrackingStatus) {
      this.props.tracking.trackEvent(
        LOG_PAGE_EVENTS.ALL_STATUSES_DROPDOWN.getChangeStatusEvent(logTrackingStatus),
      );
    }

    this.props.onChangeLogStatusFilter(isSomeActive ? activeStatuses.join(',') : undefined);
  };

  isCheckboxActive = (value) => this.getLogStatusArray().includes(value);

  handleClickOutside = (e) => {
    if (this.node.current && !this.node.current.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };

  renderStatusList = () => {
    return this.statusArray.map((status) => (
      <div className={cx('status-list-item')} key={status}>
        <InputCheckbox
          value={this.isCheckboxActive(status)}
          onChange={() => {
            this.toggleCheckbox(status);
          }}
        >
          {this.formatStatus(status)}
        </InputCheckbox>
      </div>
    ));
  };

  render() {
    const { opened } = this.state;
    const { intl } = this.props;
    return (
      <div className={cx('status-cell')} ref={this.node}>
        <div
          className={cx('status-label', {
            opened,
          })}
          onClick={this.toggleDropdown}
        >
          {this.getStatusLabel()} {Parser(ArrowIcon)}
        </div>
        {opened && (
          <div className={cx('status-list')}>
            <div className={cx('select-all-block')} onClick={this.toggleAll}>
              {intl.formatMessage(messages.statusAllLabel)}
            </div>
            {this.renderStatusList()}
          </div>
        )}
      </div>
    );
  }
}
