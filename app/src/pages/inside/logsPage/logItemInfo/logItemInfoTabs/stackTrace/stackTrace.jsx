import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import {
  logItemsSelector,
  activeLogIdSelector,
  logPaginationSelector,
  NAMESPACE,
  DEFAULT_LOG_LEVEL,
} from 'controllers/log';
import { pagePropertiesSelector } from 'controllers/pages';
import ArrowIcon from 'common/img/arrow-down-inline.svg';
import { activeProjectSelector } from 'controllers/user';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { NoItemMessage } from '../noItemMessage';
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
}))
@injectIntl
export class StackTrace extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    logItemId: PropTypes.string.isRequired,
    onChangePage: PropTypes.func.isRequired,
    pagination: PropTypes.object.isRequired,
    pageProperties: PropTypes.object.isRequired,
    logItems: PropTypes.array.isRequired,
  };

  static checkIfStackTraceItemOnThisPage = (logItems, stackTraceItem) =>
    !!logItems.find((item) => item.id === stackTraceItem.id);

  static getDerivedStateFromProps(props, state) {
    return state.activePage !== props.pagination.number
      ? {
          activePage: props.pagination.number,
          isStackTraceItemOnThisPage: StackTrace.checkIfStackTraceItemOnThisPage(
            props.logItems,
            state.stackTraceItem,
          ),
        }
      : null;
  }

  constructor(props) {
    super(props);
    this.state = {
      stackTraceItem: null,
      isStackTraceItemOnThisPage: false,
      activePage: props.pagination.number,
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchStackTrace();
  }

  fetchStackTrace = () => {
    const { logItems, projectId, logItemId } = this.props;
    this.setState({
      loading: true,
    });
    fetch(URLS.logItemStackTrace(projectId, logItemId))
      .then(({ content }) => {
        const stackTraceItem = (content.length && content[0]) || null;
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

  goToMessageInLog = ({ wasClicked, targetPageNumber }) => {
    const { isStackTraceItemOnThisPage, stackTraceItem, activePage } = this.state;

    if (isStackTraceItemOnThisPage) {
      const targetItem = document.getElementById(stackTraceItem.id);
      targetItem.scrollIntoView({ behavior: 'smooth' });
      let highlightElement = document.getElementById('highlight');
      if (!highlightElement) {
        highlightElement = document.createElement('div');
        highlightElement.setAttribute('id', 'highlight');
        highlightElement.classList.add(cx('highlight'));
        targetItem.appendChild(highlightElement);
        setTimeout(() => targetItem.classList.add(cx('hide-highlight')), 0);
      }
      return;
    }
    if (activePage === targetPageNumber) {
      return;
    }
    if (wasClicked) {
      setTimeout(() => this.goToMessageInLog({ wasClicked: true }), 400);
      return;
    }
    this.fetchMessageLocation();
  };

  fetchMessageLocation = () => {
    const { projectId, logItemId, pagination, pageProperties, onChangePage } = this.props;
    const { stackTraceItem } = this.state;
    const filterLevel = pageProperties['filter.gte.level'] || DEFAULT_LOG_LEVEL;
    return fetch(
      URLS.logItemStackTraceMessageLocation(
        projectId,
        logItemId,
        stackTraceItem.id,
        pagination.size,
        filterLevel,
      ),
    ).then(({ number }) => {
      onChangePage(number);
      this.goToMessageInLog({ wasClicked: true, targetPageNumber: number });
    });
  };

  renderStackTraceMessage = () => {
    const { intl } = this.props;
    const { stackTraceItem } = this.state;

    return (
      <div className={cx('stack-trace-content')}>
        <div className={cx('stack-trace-message')}>{stackTraceItem.message}</div>
        <div className={cx('message-reference')} onClick={this.goToMessageInLog}>
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
    if (stackTraceItem) {
      return this.renderStackTraceMessage();
    }
    return <NoItemMessage message={intl.formatMessage(messages.noStackTrace)} />;
  };

  render() {
    return <div className={cx('stack-trace')}>{this.renderStackTrace()}</div>;
  }
}
