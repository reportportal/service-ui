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
import { useIssueInfo } from '../hooks';
import styles from './issueInfo.scss';

const cx = classNames.bind(styles);

const STATUS_RESOLVED = 'RESOLVED';

const messages = defineMessages({
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

const isResolved = (status = '') => status.toUpperCase() === STATUS_RESOLVED;

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
          {issueInfo?.status && (
            <div>
              {`${formatMessage(messages.issueStatusTitle)}:`}{' '}
              <span className={cx({ resolved: isResolved(issueInfo.status) })}>
                {issueInfo.status}
              </span>
            </div>
          )}
          <div>
            {issueInfo ? issueInfo.summary : formatMessage(messages.issueNotFoundDescription)}
          </div>
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
