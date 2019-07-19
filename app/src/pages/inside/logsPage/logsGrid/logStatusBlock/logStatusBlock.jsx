import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { PASSED, FAILED, SKIPPED } from 'common/constants/testStatuses';
import ArrowIcon from 'common/img/arrow-down-inline.svg';

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
  statusLabel: {
    id: 'LogStatusBlock.statusLabel',
    defaultMessage: 'ALL STATUSES',
  },
  statusAllLabel: {
    id: 'LogStatusBlock.statusAllLabel',
    defaultMessage: 'ALL',
  },
});

const cx = classNames.bind(styles);

@injectIntl
export class LogStatusBlock extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChangeLogStatusFilter: PropTypes.func.isRequired,
    logStatus: PropTypes.string,
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

  setRef = (node) => {
    this.node = node;
  };

  getLogStatusArray = () => {
    const { logStatus } = this.props;
    return logStatus ? logStatus.split(',') : [];
  };

  statusArray = [PASSED, FAILED, SKIPPED];

  toggleDropdown = () => {
    this.setState((prevState) => ({
      opened: !prevState.opened,
    }));
  };

  toggleCheckbox = (value) => {
    const { onChangeLogStatusFilter } = this.props;
    let arr = this.getLogStatusArray();
    if (this.isCheckboxActive(value)) {
      arr = arr.filter((status) => status !== value);
    } else {
      arr = [...arr, value];
    }
    const status = arr.length ? arr.join(',') : undefined;
    onChangeLogStatusFilter(status);
  };

  toggleAll = () => {
    const { onChangeLogStatusFilter } = this.props;
    const arr = this.getLogStatusArray();
    let status = this.statusArray.join(',');
    if (arr.length === this.statusArray.length) {
      status = undefined;
    }
    onChangeLogStatusFilter(status);
  };

  isCheckboxActive = (value) => this.getLogStatusArray().includes(value);

  handleClickOutside = (e) => {
    if (!this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false });
    }
  };
  renderStatusList = () => {
    const { intl } = this.props;
    return this.statusArray.map((status) => (
      <div className={cx('status-list-item')} key={status}>
        <InputCheckbox
          value={this.isCheckboxActive(status)}
          onChange={() => {
            this.toggleCheckbox(status);
          }}
        >
          {intl.formatMessage(messages[[`status${status}`]])}
        </InputCheckbox>
      </div>
    ));
  };
  render() {
    const { opened } = this.state;
    const { intl } = this.props;
    return (
      <div className={cx('status-cell')} ref={this.setRef}>
        <div
          className={cx('status-label', {
            opened,
          })}
          onClick={this.toggleDropdown}
        >
          {intl.formatMessage(messages.statusLabel)} {Parser(ArrowIcon)}
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
