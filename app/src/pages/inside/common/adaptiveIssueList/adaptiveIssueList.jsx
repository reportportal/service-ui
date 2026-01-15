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

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { IssueList } from '@reportportal/ui-kit';
import { IssueInfo } from './issueInfo';

export const AdaptiveIssueList = ({
  issues,
  onIssueRemove,
  onIssueClick,
  onCounterClick,
  className,
  isExpanded,
}) => {
  const tooltipRoot = document.getElementById('tooltip-root');

  const issueList = useMemo(
    () =>
      issues.map((issue) => ({
        ...issue,
        key: `${issue.btsProject}_${issue.ticketId}`,
        name: issue.ticketId,
        link: issue.url,
      })),
    [issues],
  );

  const renderTooltip = useCallback((issue) => {
    return <IssueInfo issue={issue} />;
  }, []);

  return (
    <IssueList
      issues={issueList}
      isExpanded={isExpanded}
      onIssueClick={onIssueClick}
      onIssueRemove={onIssueRemove}
      onCounterClick={onCounterClick}
      renderTooltip={renderTooltip}
      tooltipPortalRoot={tooltipRoot}
      className={className}
    />
  );
};

AdaptiveIssueList.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      ticketId: PropTypes.string,
      url: PropTypes.string,
      btsProject: PropTypes.string,
      btsUrl: PropTypes.string,
      pluginName: PropTypes.string,
    }),
  ),
  onIssueRemove: PropTypes.func,
  onIssueClick: PropTypes.func,
  onCounterClick: PropTypes.func,
  className: PropTypes.string,
  isExpanded: PropTypes.bool,
};

AdaptiveIssueList.defaultProps = {
  issues: [],
  onIssueRemove: undefined,
  onIssueClick: undefined,
  onCounterClick: undefined,
  className: '',
  isExpanded: false,
};
