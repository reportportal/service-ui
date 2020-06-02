/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { activeProjectSelector } from 'controllers/user';
import { getStorageItem, updateStorageItem } from 'common/utils';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import InProgressGif from 'common/img/item-in-progress.gif';

import styles from './issueInfoTooltip.scss';

const cx = classNames.bind(styles);

const STATUS_RESOLVED = 'RESOLVED';

const messages = defineMessages({
  issueSummaryTitle: {
    id: 'IssueInfoTooltip.issueSummaryTitle',
    defaultMessage: 'Summary',
  },
  issueStatusTitle: {
    id: 'IssueInfoTooltip.issueStatusTitle',
    defaultMessage: 'Status',
  },
  issueNotFoundTitle: {
    id: 'IssueInfoTooltip.issueNotFoundTitle',
    defaultMessage: 'Issue not found',
  },
  issueNotFoundDescription: {
    id: 'IssueInfoTooltip.issueNotFoundDescription',
    defaultMessage: "Issue doesn't exist or no connection to the BTS integration",
  },
});

const isResolved = (status) => status.toUpperCase() === STATUS_RESOLVED;
const getStorageKey = (activeProject) => `${activeProject}_tickets`;

const FETCH_ISSUE_INTERVAL = 900000; // min request interval = 15 min

@connect((state) => ({
  activeProject: activeProjectSelector(state),
}))
@injectIntl
export class IssueInfoTooltip extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
    ticketId: PropTypes.string.isRequired,
    btsProject: PropTypes.string.isRequired,
    btsUrl: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.cancelRequest = () => {};
  }

  state = {
    issue: null,
    loading: false,
    error: false,
  };

  componentDidMount() {
    this.setupIssueData();
  }

  componentWillUnmount() {
    this.cancelRequest();
  }

  setupIssueData = () => {
    const { issue, lastTime } = this.getIssueFromStorage();
    const timeSinceLastExecution = Date.now() - lastTime;

    if (!lastTime || timeSinceLastExecution >= FETCH_ISSUE_INTERVAL) {
      this.fetchData();
    } else {
      this.setState({
        loading: false,
        issue,
      });
    }
  };

  getIssueFromStorage = () => {
    const { activeProject, ticketId, btsProject } = this.props;
    const storageKey = getStorageKey(activeProject);

    const data = getStorageItem(storageKey) || {};
    return data[`${btsProject}_${ticketId}`] || {};
  };

  updateIssueInStorage = (data = {}) => {
    const { activeProject, btsProject, ticketId } = this.props;
    const storageKey = getStorageKey(activeProject);

    updateStorageItem(storageKey, { [`${btsProject}_${ticketId}`]: data });
  };

  fetchData = () => {
    const { activeProject, ticketId, btsProject, btsUrl } = this.props;
    const cancelRequestFunc = (cancel) => {
      this.cancelRequest = cancel;
    };
    this.setState({ loading: true });

    fetch(URLS.btsTicket(activeProject, ticketId, btsProject, btsUrl), {
      abort: cancelRequestFunc,
    })
      .then((issue) => {
        this.updateIssueInStorage({ issue, lastTime: Date.now() });
        this.setState({ loading: false, issue });
      })
      .catch((err) => {
        this.updateIssueInStorage();
        if (err.message === ERROR_CANCELED) {
          return;
        }
        this.setState({ loading: false, error: true });
      });
  };

  renderTooltipContent = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const { loading, issue } = this.state;

    if (loading) {
      return (
        <div className={cx('progressbar')}>
          <img src={InProgressGif} alt="Loading" />
        </div>
      );
    }

    return issue ? (
      <Fragment>
        <h4 className={cx('header')}>{formatMessage(messages.issueSummaryTitle)}</h4>
        <p className={cx('content')}>{issue.summary}</p>
        <h4 className={cx('header')}>{formatMessage(messages.issueStatusTitle)}</h4>
        <p
          className={cx('content', {
            resolved: isResolved(issue.status),
          })}
        >
          {issue.status}
        </p>
      </Fragment>
    ) : (
      <Fragment>
        <h4 className={cx('header')}>{formatMessage(messages.issueNotFoundTitle)}</h4>
        <p className={cx('content')}>{formatMessage(messages.issueNotFoundDescription)}</p>
      </Fragment>
    );
  };

  render() {
    return <div className={cx('issue-tooltip')}>{this.renderTooltipContent()}</div>;
  }
}
