import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import { MARKDOWN, CONSOLE, DEFAULT } from 'common/constants/logViewModes';
import { userIdSelector } from 'controllers/user';
import {
  getWithAttachments,
  LOG_LEVELS,
  getLogViewMode,
  setLogViewMode,
  getHidePassedLogs,
  getHideEmptySteps,
  DETAILED_LOG_VIEW,
  isLogPageWithOutNestedSteps,
  isLogPageWithNestedSteps,
} from 'controllers/log';
import { InputSlider } from 'components/inputs/inputSlider';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import ConsoleIcon from 'common/img/console-inline.svg';
import MarkdownIcon from 'common/img/markdown-inline.svg';
import { Pagination } from './pagination';
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
  hideEmptySteps: {
    id: 'LogsGridToolbar.hideEmptySteps',
    defaultMessage: 'Hide Empty Steps',
  },
  hidePassedLogs: {
    id: 'LogsGridToolbar.hidePassedLogs',
    defaultMessage: 'Hide All Passed Logs',
  },
});

@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
  isLogView: isLogPageWithOutNestedSteps(state),
  isNestedStepsView: isLogPageWithNestedSteps(state),
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
    onHideEmptySteps: PropTypes.func,
    onHidePassedLogs: PropTypes.func,
    logPageMode: PropTypes.string,
    isLogView: PropTypes.bool,
    isNestedStepsView: PropTypes.bool,
  };

  static defaultProps = {
    children: () => {},
    onChangeLogLevel: () => {},
    onChangeWithAttachments: () => {},
    onHideEmptySteps: () => {},
    onHidePassedLogs: () => {},
    logPageMode: DETAILED_LOG_VIEW,
    isLogView: true,
    isNestedStepsView: false,
  };

  state = {
    logViewMode: getLogViewMode(this.props.userId),
    withAttachments: getWithAttachments(this.props.userId),
    hidePassedLogs: getHidePassedLogs(this.props.userId),
    hideEmptySteps: getHideEmptySteps(this.props.userId),
  };

  toggleLogViewMode = (targetViewMode) => {
    const { logViewMode } = this.state;

    const newLogViewMode = logViewMode === targetViewMode ? DEFAULT : targetViewMode;
    setLogViewMode(this.props.userId, newLogViewMode);

    this.setState({
      logViewMode: newLogViewMode,
    });
  };

  toggleMarkdownMode = () => this.toggleLogViewMode(MARKDOWN);

  toggleConsoleView = () => this.toggleLogViewMode(CONSOLE);

  changeLogLevel = (newLogLevel) => {
    const { onChangeLogLevel, userId, logLevel: activeLogLevel } = this.props;

    if (newLogLevel.id !== activeLogLevel.id) {
      onChangeLogLevel(userId, newLogLevel);
    }
  };

  toggleWithAttachments = () => {
    const { withAttachments } = this.state;
    const { onChangeWithAttachments, userId } = this.props;

    onChangeWithAttachments(userId, !withAttachments);

    this.setState({
      withAttachments: !withAttachments,
    });
  };

  toggleHidePassedLogs = () => {
    const { hidePassedLogs } = this.state;
    const { onHidePassedLogs, userId } = this.props;

    onHidePassedLogs(userId, !hidePassedLogs);

    this.setState({
      hidePassedLogs: !hidePassedLogs,
    });
  };

  toggleHideEmptySteps = () => {
    const { hideEmptySteps } = this.state;
    const { onHideEmptySteps, userId } = this.props;

    onHideEmptySteps(userId, !hideEmptySteps);

    this.setState({
      hideEmptySteps: !hideEmptySteps,
    });
  };
  isConsoleViewMode = () => {
    const { isLogView } = this.props;
    const { logViewMode } = this.state;
    return logViewMode === CONSOLE && isLogView;
  };
  render() {
    const {
      intl,
      children,
      activePage,
      pageCount,
      onChangePage,
      logLevel,
      logPageMode,
      isLogView,
      isNestedStepsView,
    } = this.props;
    const { logViewMode, withAttachments, hidePassedLogs } = this.state;
    return (
      <div className={cx('container')}>
        <div className={cx('panel')}>
          <div className={cx('aside')}>
            <div className={cx('log-level')}>
              <InputSlider options={LOG_LEVELS} value={logLevel} onChange={this.changeLogLevel} />
            </div>
            {logPageMode === DETAILED_LOG_VIEW && (
              <Fragment>
                <div className={cx('aside-element')}>
                  <InputCheckbox value={withAttachments} onChange={this.toggleWithAttachments}>
                    {intl.formatMessage(messages.withAttachments)}
                  </InputCheckbox>
                </div>
                {isNestedStepsView && (
                  <div className={cx('aside-element')}>
                    <InputCheckbox value={hidePassedLogs} onChange={this.toggleHidePassedLogs}>
                      {intl.formatMessage(messages.hidePassedLogs)}
                    </InputCheckbox>
                  </div>
                )}
                {/* <div className={cx('aside-element')}>
                  <InputCheckbox value={hideEmptySteps} onChange={this.toggleHideEmptySteps}>
                    {intl.formatMessage(messages.hideEmptySteps)}
                  </InputCheckbox>
                </div> */}
              </Fragment>
            )}
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
              {isLogView && (
                <button
                  className={cx('mode-button', 'console', { active: logViewMode === CONSOLE })}
                  onClick={this.toggleConsoleView}
                  title={intl.formatMessage(messages.consoleView)}
                >
                  {Parser(ConsoleIcon)}
                </button>
              )}
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
            consoleView: this.isConsoleViewMode(),
          })}
        </div>
      </div>
    );
  }
}
