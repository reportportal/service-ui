/*
 * Copyright 2025 EPAM Systems
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

import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { BubblesLoader } from '@reportportal/ui-kit';
import { dateFormat } from 'common/utils/timeDateUtils';
import { useIssueInfo } from '../hooks';
import styles from './issueInfo.scss';

const cx = classNames.bind(styles);

const STATUS_RESOLVED = 'RESOLVED';

const messages = defineMessages({
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
  issueFixVersionsTitle: {
    id: 'IssueInfoTooltip.issueFixVersionsTitle',
    defaultMessage: 'Fix version',
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
const formatCreatedDate = (created) => (created ? dateFormat(new Date(created).getTime()) : null);

const IssueDetailRow = ({ label, value, resolved }) => (
  <div className={cx('detail-row')}>
    <span className={cx('detail-label')}>{label}:</span>{' '}
    <span className={cx('detail-value', { resolved })}>{value}</span>
  </div>
);

IssueDetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  resolved: PropTypes.bool,
};

IssueDetailRow.defaultProps = {
  resolved: false,
};

export const IssueInfo = ({ issue }) => {
  const { formatMessage } = useIntl();
  const { issueInfo, loading } = useIssueInfo(issue, issue.pluginName);

  return (
    <div className={cx('issue-tooltip')}>
      {loading ? (
        <BubblesLoader className={cx('preloader')} />
      ) : (
        <div className={cx('content')}>
          <h4 className={cx('header')}>
            {issueInfo ? issue.ticketId : formatMessage(messages.issueNotFoundTitle)}
          </h4>
          {issueInfo ? (
            <>
              <div className={cx('summary')}>{issueInfo.summary}</div>
              {issueInfo.reporter && (
                <IssueDetailRow
                  label={formatMessage(messages.issueReporterTitle)}
                  value={issueInfo.reporter}
                />
              )}
              {issueInfo.assignee && (
                <IssueDetailRow
                  label={formatMessage(messages.issueAssigneeTitle)}
                  value={issueInfo.assignee}
                />
              )}
              {issueInfo.created && (
                <IssueDetailRow
                  label={formatMessage(messages.issueCreatedTitle)}
                  value={formatCreatedDate(issueInfo.created)}
                />
              )}
              {issueInfo.status && (
                <IssueDetailRow
                  label={formatMessage(messages.issueStatusTitle)}
                  value={issueInfo.status}
                  resolved={isResolved(issueInfo.status)}
                />
              )}
              {issueInfo.fixVersions && (
                <IssueDetailRow
                  label={formatMessage(messages.issueFixVersionsTitle)}
                  value={issueInfo.fixVersions}
                />
              )}
              {issueInfo.severity && (
                <IssueDetailRow
                  label={formatMessage(messages.issueSeverityTitle)}
                  value={issueInfo.severity}
                />
              )}
            </>
          ) : (
            <div>{formatMessage(messages.issueNotFoundDescription)}</div>
          )}
        </div>
      )}
    </div>
  );
};

IssueInfo.propTypes = {
  issue: PropTypes.shape({
    ticketId: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    btsProject: PropTypes.string.isRequired,
    btsUrl: PropTypes.string.isRequired,
    pluginName: PropTypes.string,
  }).isRequired,
};
