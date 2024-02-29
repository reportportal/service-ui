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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { URLS } from 'common/urls';
import { pluginByNameSelector, isPluginSupportsCommonCommand } from 'controllers/plugins';
import { COMMAND_GET_ISSUE } from 'controllers/plugins/uiExtensions/constants';
import { projectInfoIdSelector } from 'controllers/project/selectors';
import { getStorageItem, updateStorageItem } from 'common/utils';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import { projectKeySelector } from 'controllers/project';
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
const getStorageKey = (projectKey) => `${projectKey}_tickets`;

const FETCH_ISSUE_INTERVAL = 900000; // min request interval = 15 min

@connect((state, ownProps) => ({
  projectKey: projectKeySelector(state),
  plugin: pluginByNameSelector(state, ownProps.pluginName),
  projectId: projectInfoIdSelector(state),
}))
@injectIntl
export class IssueInfoTooltip extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.number.isRequired,
    ticketId: PropTypes.string.isRequired,
    btsProject: PropTypes.string.isRequired,
    btsUrl: PropTypes.string.isRequired,
    plugin: PropTypes.object,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    plugin: null,
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
    const { projectKey, ticketId, btsProject } = this.props;
    const storageKey = getStorageKey(projectKey);

    const data = getStorageItem(storageKey) || {};
    return data[`${btsProject}_${ticketId}`] || {};
  };

  updateIssueInStorage = (data = {}) => {
    const { projectKey, btsProject, ticketId } = this.props;
    const storageKey = getStorageKey(projectKey);

    updateStorageItem(storageKey, { [`${btsProject}_${ticketId}`]: data });
  };

  fetchData = () => {
    const { projectId, ticketId, btsProject, btsUrl, plugin, projectKey } = this.props;
    const cancelRequestFunc = (cancel) => {
      this.cancelRequest = cancel;
    };
    this.setState({ loading: true });
    const isCommonCommandSupported =
      plugin && isPluginSupportsCommonCommand(plugin, COMMAND_GET_ISSUE);
    let url;
    let data;

    if (isCommonCommandSupported) {
      url = URLS.pluginCommandCommon(projectKey, plugin.name, COMMAND_GET_ISSUE);
      data = {
        ticketId,
        url: btsUrl,
        project: btsProject,
        projectId,
      };
    } else {
      url = URLS.btsTicket(projectKey, ticketId, btsProject, btsUrl);
    }

    fetch(url, {
      method: isCommonCommandSupported ? 'PUT' : 'GET',
      data,
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
          <DottedPreloader color="charcoal" />
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
