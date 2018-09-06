import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils';
import { MarkdownViewer } from 'components/main/markdown/markdownViewer/markdownViewer';
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

  safeMessage = (message) =>
    Parser(message.replace(/\n */g, (str) => str.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;')));

  safeMarkdown = (message) => message.replace(/^!!!MARKDOWN_MODE!!!/, '');
  supportMarkdown = () => this.props.value.message.search(/^!!!MARKDOWN_MODE!!!/) + 1;

  render() {
    const { value, refFunction, customProps } = this.props;

    return (
      <div ref={refFunction} className={cx('log-message-block')}>
        {customProps.consoleView && <span className={cx('time')}>{dateFormat(value.time)}</span>}
        {this.supportMarkdown() ? (
          <MarkdownViewer value={this.safeMarkdown(value.message)} />
        ) : (
          <div className={cx('log-message')}>{this.safeMessage(value.message)}</div>
        )}
      </div>
    );
  }
}
