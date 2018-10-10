import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { userIdSelector } from 'controllers/user';
import { InputSlider } from 'components/inputs/inputSlider';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { GhostButton } from 'components/buttons/ghostButton';
import { Pagination } from './pagination';
import { getLogLevel, LOG_LEVELS, setLogLevel } from './utils/logLevel';
import { getWithAttachments, setWithAttachments } from './utils/withAttachments';
import ConsoleIcon from './img/console-inline.svg';
import MarkdownIcon from './img/markdown-inline.svg';
import styles from './logsGridToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  withAttachments: {
    id: 'LogsGridToolbar.withAttachments',
    defaultMessage: 'Logs with Attachment',
  },
  markdownMode: {
    id: 'LogsGridToolbar.markdownMode',
    defaultMessage: 'Markdown Mode',
  },
  consoleView: {
    id: 'LogsGridToolbar.consoleView',
    defaultMessage: 'Console View',
  },
  nextError: {
    id: 'LogsGridToolbar.nextError',
    defaultMessage: 'Next Error',
  },
});

@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
}))
export class LogsGridToolbar extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    activePage: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    initialLogLevel: PropTypes.string,
    children: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
    onChangeWithAttachments: PropTypes.func,
  };

  static defaultProps = {
    initialLogLevel: null,
    children: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
  };

  state = {
    markdownMode: false,
    consoleView: false,
    withAttachments: getWithAttachments(this.props.userId),
    logLevel: getLogLevel(this.props.initialLogLevel, this.props.userId),
  };

  toggleMarkdownMode = () => {
    const { markdownMode, consoleView } = this.state;

    if (!markdownMode && consoleView) {
      this.toggleConsoleView();
    }

    this.setState({
      markdownMode: !markdownMode,
    });
  };

  toggleConsoleView = () => {
    const { markdownMode, consoleView } = this.state;

    if (!consoleView && markdownMode) {
      this.toggleMarkdownMode();
    }

    this.setState({
      consoleView: !consoleView,
    });
  };

  changeLogLevel = (logLevel) => {
    const { onChangeLogLevel, userId } = this.props;

    if (logLevel.id !== this.state.logLevel.id) {
      this.setState({
        logLevel,
      });

      onChangeLogLevel(logLevel);

      setLogLevel(logLevel, userId);
    }
  };

  toggleWithAttachments = () => {
    const { withAttachments } = this.state;
    const { onChangeWithAttachments, userId } = this.props;

    onChangeWithAttachments(!withAttachments);

    this.setState({
      withAttachments: !withAttachments,
    });

    setWithAttachments(!withAttachments, userId);
  };

  render() {
    const { intl, children, activePage, pageCount, onChangePage } = this.props;
    const { markdownMode, consoleView, logLevel, withAttachments } = this.state;

    return (
      <div className={cx('container')}>
        <div className={cx('panel')}>
          <div className={cx('aside')}>
            <div className={cx('log-level')}>
              <InputSlider options={LOG_LEVELS} value={logLevel} onChange={this.changeLogLevel} />
            </div>
            <div className={cx('with-attachments')}>
              <InputCheckbox value={withAttachments} onChange={this.toggleWithAttachments}>
                {intl.formatMessage(messages.withAttachments)}
              </InputCheckbox>
            </div>
          </div>
          <div className={cx('aside')}>
            <div className={cx('mode-buttons')}>
              <button
                className={cx('mode-button', 'markdown', { active: markdownMode })}
                onClick={this.toggleMarkdownMode}
                title={intl.formatMessage(messages.markdownMode)}
              >
                {Parser(MarkdownIcon)}
              </button>
              <button
                className={cx('mode-button', 'console', { active: consoleView })}
                onClick={this.toggleConsoleView}
                title={intl.formatMessage(messages.consoleView)}
              >
                {Parser(ConsoleIcon)}
              </button>
            </div>
            <div className={cx('action-buttons')}>
              <GhostButton disabled>{intl.formatMessage(messages.nextError)}</GhostButton>
            </div>
            <div className={cx('pagination')}>
              <Pagination
                activePage={activePage}
                pageCount={pageCount}
                onChangePage={onChangePage}
              />
            </div>
          </div>
        </div>
        <div className={cx('children')}>
          {children({
            markdownMode,
            consoleView,
          })}
        </div>
      </div>
    );
  }
}
