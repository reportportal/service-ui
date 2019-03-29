import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { MARKDOWN, CONSOLE, DEFAULT } from 'common/constants/logViewModes';
import { userIdSelector } from 'controllers/user';
import { getWithAttachments, LOG_LEVELS, getLogViewMode, setLogViewMode } from 'controllers/log';
import { InputSlider } from 'components/inputs/inputSlider';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { GhostButton } from 'components/buttons/ghostButton';
import { Pagination } from './pagination';
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
    logLevel: PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }).isRequired,
    children: PropTypes.func,
    onChangeLogLevel: PropTypes.func,
    onChangeWithAttachments: PropTypes.func,
  };

  static defaultProps = {
    children: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
  };

  state = {
    logViewMode: getLogViewMode(this.props.userId),
    withAttachments: getWithAttachments(this.props.userId),
  };

  toggleLogViewMode = (targetViewMode) => {
    const { logViewMode } = this.state;

    const newLogViewMode = logViewMode === targetViewMode ? DEFAULT : targetViewMode;
    setLogViewMode(newLogViewMode, this.props.userId);

    this.setState({
      logViewMode: newLogViewMode,
    });
  };

  toggleMarkdownMode = () => this.toggleLogViewMode(MARKDOWN);

  toggleConsoleView = () => this.toggleLogViewMode(CONSOLE);

  changeLogLevel = (newLogLevel) => {
    const { onChangeLogLevel, userId, logLevel: activeLogLevel } = this.props;

    if (newLogLevel.id !== activeLogLevel.id) {
      onChangeLogLevel(newLogLevel, userId);
    }
  };

  toggleWithAttachments = () => {
    const { withAttachments } = this.state;
    const { onChangeWithAttachments, userId } = this.props;

    onChangeWithAttachments(!withAttachments, userId);

    this.setState({
      withAttachments: !withAttachments,
    });
  };

  render() {
    const { intl, children, activePage, pageCount, onChangePage, logLevel } = this.props;
    const { logViewMode, withAttachments } = this.state;

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
                className={cx('mode-button', 'markdown', { active: logViewMode === MARKDOWN })}
                onClick={this.toggleMarkdownMode}
                title={intl.formatMessage(messages.markdownMode)}
              >
                {Parser(MarkdownIcon)}
              </button>
              <button
                className={cx('mode-button', 'console', { active: logViewMode === CONSOLE })}
                onClick={this.toggleConsoleView}
                title={intl.formatMessage(messages.consoleView)}
              >
                {Parser(ConsoleIcon)}
              </button>
            </div>
            <div className={cx('action-buttons')}>
              <GhostButton disabled>{intl.formatMessage(messages.nextError)}</GhostButton>
            </div>
            {pageCount !== 0 && (
              <div className={cx('pagination')}>
                <Pagination
                  activePage={activePage}
                  pageCount={pageCount}
                  onChangePage={onChangePage}
                />
              </div>
            )}
          </div>
        </div>
        <div className={cx('children')}>
          {children({
            markdownMode: logViewMode === MARKDOWN,
            consoleView: logViewMode === CONSOLE,
          })}
        </div>
      </div>
    );
  }
}
