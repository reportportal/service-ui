import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { sauceLabsLogsSelector } from 'controllers/log/sauceLabs';
import styles from './logsSection.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  logs: sauceLabsLogsSelector(state),
}))
export class LogsSection extends Component {
  static propTypes = {
    logs: PropTypes.array,
  };

  static defaultProps = {
    logs: [],
  };

  render() {
    return <div className={cx('logs-section')} />;
  }
}
