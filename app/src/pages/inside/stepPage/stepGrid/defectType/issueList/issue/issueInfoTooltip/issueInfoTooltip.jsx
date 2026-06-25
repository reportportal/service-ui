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
import { buildPluginCommandRQ } from 'controllers/plugins/utils';
import { COMMAND_GET_ISSUE } from 'controllers/plugins/uiExtensions/constants';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectInfoIdSelector, projectKeySelector } from 'controllers/project';
import { getStorageItem, updateStorageItem } from 'common/utils';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import { DottedPreloader } from 'components/preloaders/dottedPreloader';
import { dateFormat } from 'common/utils/timeDateUtils';

import styles from './issueInfoTooltip.scss';

const cx = classNames.bind(styles);

const STATUS_RESOLVED = 'RESOLVED';

const TICKET_CACHE_VERSION = '2';

const messages = defineMessages({
  issueSummaryTitle: {
    id: 'IssueInfoTooltip.issueSummaryTitle',
    defaultMessage: 'Summary',
  },
  issueStatusTitle: {
    id: 'IssueInfoTooltip.issueStatusTitle',
    defaultMessage: 'Status',
  },
  issueReporterTitle: {
    id: 'IssueInfoTooltip.issueReporterTitle',
    defaultMessage: 'Reporter',
  },
  issueAssigneeTitle: {
    id: 'IssueInfoTooltip.issueAssigneeTitle',
    defaultMessage: 'Assigned Developer(s)',
  },
  issueCreatedTitle: {
    id: 'IssueInfoTooltip.issueCreatedTitle',
    defaultMessage: 'Created',
  },
  issueSeverityTitle: {
    id: 'IssueInfoTooltip.issueSeverityTitle',
    defaultMessage: 'Severity',
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

const isResolved = (status = '') => status.toUpperCase() === STATUS_RESOLVED;
const getStorageKey = (projectKey) => `${projectKey}_tickets_v${TICKET_CACHE_VERSION}`;
const formatCreatedDate = (created) => (created ? dateFormat(new Date(created).getTime()) : null);

const IssueFieldRow = ({ label, value, resolved }) => (
  <div className={cx('row')}>
    <h4 className={cx('header')}>{label}</h4>
    <p className={cx('content', { resolved })}>{value}</p>
  </div>
);

IssueFieldRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  resolved: PropTypes.bool,
};

IssueFieldRow.defaultProps = {
  resolved: false,
};

const FETCH_ISSUE_INTERVAL = 900000; // min request interval = 15 min

@connect((state, ownProps) => ({
  projectKey: projectKeySelector(state),
  plugin: pluginByNameSelector(state, ownProps.pluginName),
  projectId: projectInfoIdSelector(state),
  organizationId: activeOrganizationIdSelector(state),
}))
@injectIntl
export class IssueInfoTooltip extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.number.isRequired,
    organizationId: PropTypes.number,
    ticketId: PropTypes.string.isRequired,
    btsProject: PropTypes.string.isRequired,
    btsUrl: PropTypes.string.isRequired,
    plugin: PropTypes.object,
    projectKey: PropTypes.string.isRequired,
  };

  static defaultProps = {
    plugin: null,
    organizationId: null,
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
    const { projectId, ticketId, btsProject, btsUrl, plugin, projectKey, organizationId } =
      this.props;
    const cancelRequestFunc = (cancel) => {
      this.cancelRequest = cancel;
    };
    this.setState({ loading: true });
    const isCommonCommandSupported =
      plugin && isPluginSupportsCommonCommand(plugin, COMMAND_GET_ISSUE);
    let url;
    let requestParams = { abort: cancelRequestFunc };

    if (isCommonCommandSupported) {
      url = URLS.pluginsCommandsCommon(plugin.name, COMMAND_GET_ISSUE);
      requestParams = {
        ...requestParams,
        method: 'POST',
        data: buildPluginCommandRQ({
          organizationId,
          projectId,
          projectKey,
          arguments: {
            ticketId,
            url: btsUrl,
            project: btsProject,
          },
        }),
      };
    } else {
      url = URLS.btsTicket(projectKey, ticketId, btsProject, btsUrl);
      requestParams = { ...requestParams, method: 'GET' };
    }

    fetch(url, requestParams)
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
        <IssueFieldRow
          label={formatMessage(messages.issueSummaryTitle)}
          value={issue.summary}
        />
        {issue.reporter && (
          <IssueFieldRow
            label={formatMessage(messages.issueReporterTitle)}
            value={issue.reporter}
          />
        )}
        {issue.assignee && (
          <IssueFieldRow
            label={formatMessage(messages.issueAssigneeTitle)}
            value={issue.assignee}
          />
        )}
        {issue.created && (
          <IssueFieldRow
            label={formatMessage(messages.issueCreatedTitle)}
            value={formatCreatedDate(issue.created)}
          />
        )}
        {issue.status && (
          <IssueFieldRow
            label={formatMessage(messages.issueStatusTitle)}
            value={issue.status}
            resolved={isResolved(issue.status)}
          />
        )}
        {issue.severity && (
          <IssueFieldRow
            label={formatMessage(messages.issueSeverityTitle)}
            value={issue.severity}
          />
        )}
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
