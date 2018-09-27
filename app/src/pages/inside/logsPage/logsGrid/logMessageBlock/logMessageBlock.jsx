import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils';
import { MarkdownViewer } from 'components/main/markdown';
import { safeMessage } from '../../utils';
import styles from './logMessageBlock.scss';

const cx = classNames.bind(styles);

export class LogMessageBlock extends Component {
  static propTypes = {
    value: PropTypes.object.isRequired,
    customProps: PropTypes.object,
    refFunction: PropTypes.func,
  };

  static defaultProps = {
    customProps: {},
    refFunction: null,
  };

  render() {
    const { value, refFunction, customProps } = this.props;

    return (
      <div ref={refFunction} className={cx('log-message-block')}>
        {customProps.consoleView && <span className={cx('time')}>{dateFormat(value.time)}</span>}
        {customProps.markdownMode ? (
          <MarkdownViewer value={value.message} />
        ) : (
          <div className={cx('log-message')}>{safeMessage(value.message)}</div>
        )}
      </div>
    );
  }
}
