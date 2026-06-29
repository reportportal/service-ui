/*
 * Copyright 2026 EPAM Systems
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

import { FC, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, IssueList, PlusIcon } from '@reportportal/ui-kit';
import type { Issue } from '@reportportal/ui-kit/issueList';
import { isEmpty } from 'es-toolkit/compat';
import { useDispatch, useSelector } from 'react-redux';

import { createClassnames, fetch } from 'common/utils';
import { BtsTicket, TestCaseExecution } from 'controllers/manualLaunch';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { showErrorNotification } from 'controllers/notification';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { ExecutionStatus } from 'types/testCase';

import { messages as executionPageMessages } from '../messages';
import { messages as executionSidePanelMessages } from '../../manualLaunchDetailsPage/manualLaunchExecutions/executionSidePanel/messages';
import { useBTSIssuesModal } from '../BTSIssuesModal/useBTSIssuesModal';

import styles from './LinkedToBTSSection.scss';

const cx = createClassnames(styles);

const convertBTSTicketsToIssues = (tickets: BtsTicket[]): Issue[] =>
  tickets.map(
    (ticket) =>
      ({
        ...ticket,
        key: String(ticket.ticketId),
        name: String(ticket.ticketId),
        link: ticket.url,
      }) as Issue,
  );

interface LinkedToBTSSectionProps {
  execution: TestCaseExecution;
}

const getTicketId = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const ticketId = (value as Record<string, unknown>).ticketId;
  if (typeof ticketId === 'string' && ticketId) {
    return ticketId;
  }

  const name = (value as Record<string, unknown>).name;
  return typeof name === 'string' && name ? name : null;
};

export const LinkedToBTSSection: FC<LinkedToBTSSectionProps> = ({ execution }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { openModal } = useBTSIssuesModal();
  const { canManageExecutions } = useUserPermissions();

  const [displayedBtsTickets, setDisplayedBtsTickets] = useState<BtsTicket[]>(
    execution.btsTickets ?? [],
  );
  const hasBtsTickets = !isEmpty(displayedBtsTickets);
  const btsIssues = convertBTSTicketsToIssues(displayedBtsTickets);
  const executionId = execution.id;
  const testItemId = execution.testItemId || executionId;

  const handleIssueRemove = useCallback(
    (issue: unknown) => {
      const ticketId = getTicketId(issue);

      if (!ticketId) {
        return;
      }

      const previousTickets = displayedBtsTickets;
      const updatedTickets = displayedBtsTickets.filter((ticket) => ticket.ticketId !== ticketId);

      setDisplayedBtsTickets(updatedTickets);

      fetch(URLS.testItemsUnlinkIssues(projectKey), {
        method: 'PUT',
        data: {
          ticketIds: [ticketId],
          testItemIds: [testItemId],
        },
      }).catch((error: Error) => {
        setDisplayedBtsTickets(previousTickets);
        dispatch(
          showErrorNotification({
            message: error.message,
          }),
        );
      });
    },
    [displayedBtsTickets, projectKey, testItemId, dispatch],
  );

  return (
    <section className={cx('linked-to-bts-section')}>
      <div className={cx('linked-to-bts-section__header')}>
        <span className={cx('linked-to-bts-section__title')}>
          {formatMessage(executionSidePanelMessages.linkedToBTS)}
        </span>
        {hasBtsTickets && execution.executionStatus === ExecutionStatus.FAILED && canManageExecutions && (
          <Button
            variant="text"
            iconPlace="start"
            icon={<PlusIcon />}
            onClick={() => openModal(execution.id)}
            className={cx('linked-to-bts-section__action')}
          >
            {formatMessage(executionPageMessages.postOrLinkIssue)}
          </Button>
        )}
      </div>

      {hasBtsTickets && (
        <div className={cx('linked-to-bts-section__issues')}>
          <IssueList
            issues={btsIssues}
            className={cx('linked-to-bts-section__issue')}
            onIssueRemove={handleIssueRemove}
          />
        </div>
      )}

      {!hasBtsTickets && (
        <div className={cx('linked-to-bts-section__empty-content')}>
          <span className={cx('linked-to-bts-section__empty-text')}>
            {formatMessage({
              id: 'ManualLaunchExecutionPage.noLinkedIssuesYet',
              defaultMessage: 'No linked issues yet',
            })}
          </span>
          {execution.executionStatus === ExecutionStatus.FAILED && canManageExecutions && (
            <Button
              variant="text"
              iconPlace="start"
              icon={<PlusIcon />}
              onClick={() => openModal(execution.id)}
              className={cx('linked-to-bts-section__action')}
            >
              {formatMessage(executionPageMessages.postOrLinkIssue)}
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
