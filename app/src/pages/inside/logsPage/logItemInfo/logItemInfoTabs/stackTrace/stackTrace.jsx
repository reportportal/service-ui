import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import isEqual from 'fast-deep-equal';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  logItemsSelector,
  activeLogIdSelector,
  logPaginationSelector,
  NAMESPACE,
  getLogLevelById,
  getLogLevel,
} from 'controllers/log';
import { pagePropertiesSelector } from 'controllers/pages';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { FATAL, ERROR } from 'common/constants/logLevels';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from 'components/main/noItemMessage';
import styles from './stackTrace.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  messageRefCaption: {
    id: 'StackTrace.messageRefCaption',
    defaultMessage: 'Go to stack trace in log message',
  },
  noStackTrace: {
    id: 'StackTrace.noStackTrace',
    defaultMessage: 'No stack trace to display',
  },
});

@connect((state) => ({
  logItemId: activeLogIdSelector(state),
  projectId: activeProjectSelector(state),
  pagination: logPaginationSelector(state),
  pageProperties: pagePropertiesSelector(state, NAMESPACE),
  logItems: logItemsSelector(state),
  userId: userIdSelector(state),
}))
@injectIntl
export class StackTrace extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    logItemId: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    onChangeLogLevel: PropTypes.func.isRequired,
    pagination: PropTypes.object.isRequired,
    pageProperties: PropTypes.object.isRequired,
    logItems: PropTypes.array.isRequired,
    onHighlightRow: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  };

  static checkIfStackTraceItemOnThisPage = (logItems, stackTraceItem) =>
    !!logItems.find((item) => item.id === stackTraceItem.id);

  static getDerivedStateFromProps(props, state) {
    return {
      activePage: props.pagination.number,
      isStackTraceItemOnThisPage: StackTrace.checkIfStackTraceItemOnThisPage(
        props.logItems,
        state.stackTraceItem,
      ),
    };
  }

  state = {
    stackTraceItem: {},
    isStackTraceItemOnThisPage: false,
    activePage: this.props.pagination.number,
    loading: false,
  };

  componentDidMount() {
    this.fetchStackTrace();
  }

  componentDidUpdate(prevProps) {
    this.checkIfPageWasChanged(prevProps);
  }

  updateFilterLevel = (filterLevel) => {
    if (filterLevel === FATAL) {
      const newLogLevel = getLogLevelById(ERROR);
      this.props.onChangeLogLevel(this.props.userId, newLogLevel);
      return ERROR;
    }
    return filterLevel;
  };

  checkIfPageWasChanged = (prevProps) => {
    if (
      prevProps.logItemId !== this.props.logItemId ||
      !isEqual(prevProps.pageProperties, this.props.pageProperties)
    ) {
      this.setState({
        isStackTraceItemOnThisPage: false,
      });
      return;
    }
    if (
      this.props.logItems.length &&
      this.state.isStackTraceItemOnThisPage &&
      this.state.messageReferenceWasClicked
    ) {
      this.highlightStackTrace();
    }
  };

  highlightStackTrace = () => {
    this.props.onHighlightRow(this.state.stackTraceItem.id);
    this.setState({
      messageReferenceWasClicked: false,
    });
  };

  fetchStackTrace = () => {
    const { logItems, projectId, logItemId } = this.props;
    this.setState({
      loading: true,
    });
    fetch(URLS.logItemStackTrace(projectId, logItemId))
      .then(({ content }) => {
        const stackTraceItem = (content.length && content[0]) || {};
        this.setState({
          stackTraceItem,
          isStackTraceItemOnThisPage: StackTrace.checkIfStackTraceItemOnThisPage(
            logItems,
            stackTraceItem,
          ),
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  };

  fetchMessageLocation = () => {
    const { projectId, logItemId, pagination, onChangePage, userId } = this.props;
    const { stackTraceItem, isStackTraceItemOnThisPage } = this.state;
    this.setState({
      messageReferenceWasClicked: true,
    });
    if (isStackTraceItemOnThisPage) {
      return;
    }
    const filterLevel = this.updateFilterLevel(getLogLevel(userId).id);
    fetch(
      URLS.logItemStackTraceMessageLocation(
        projectId,
        logItemId,
        stackTraceItem.id,
        pagination.size,
        filterLevel,
      ),
    ).then(({ number }) => {
      pagination.number !== number && onChangePage(number);
    });
  };

  renderStackTraceMessage = () => {
    const { intl } = this.props;
    const { stackTraceItem } = this.state;

    return (
      <div className={cx('stack-trace-content')}>
        <div className={cx('stack-trace-message')}>{stackTraceItem.message}</div>
        <div className={cx('message-reference')} onClick={this.fetchMessageLocation}>
          {intl.formatMessage(messages.messageRefCaption)}
          <div className={cx('ref-icon')}>{Parser(ArrowIcon)}</div>
        </div>
      </div>
    );
  };

  renderStackTrace = () => {
    const { intl } = this.props;
    const { stackTraceItem, loading } = this.state;

    if (loading) {
      return <SpinningPreloader />;
    }
    if (Object.keys(stackTraceItem).length) {
      return this.renderStackTraceMessage();
    }
    return <NoItemMessage message={intl.formatMessage(messages.noStackTrace)} />;
  };

  render() {
    return <div className={cx('stack-trace')}>{this.renderStackTrace()}</div>;
  }
}
