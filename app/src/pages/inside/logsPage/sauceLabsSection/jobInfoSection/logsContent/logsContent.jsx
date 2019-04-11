import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './logsContent.scss';

const cx = classNames.bind(styles);

@connect(null)
export class LogsContent extends Component {
  static propTypes = {
    logs: PropTypes.array,
  };

  static defaultProps = {
    logs: [],
  };

  render() {
    return <div className={cx('logs-content')} />;
  }
}
