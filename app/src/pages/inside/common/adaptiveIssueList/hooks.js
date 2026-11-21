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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { buildPluginCommandRQ } from 'controllers/plugins/utils';
import { COMMAND_GET_ISSUE } from 'controllers/plugins/uiExtensions/constants';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectInfoIdSelector, projectKeySelector } from 'controllers/project';
import {
  getCachedTicket,
  getTicketsStorageKey,
  updateCachedTicket,
} from 'common/utils/ticketsCache';
import { userIdSelector } from 'controllers/user';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';

const FETCH_ISSUE_INTERVAL = 900000; // 15 min

const getStoredIssueData = (userId, projectKey, btsProject, ticketId) =>
  getCachedTicket(getTicketsStorageKey(userId, projectKey), `${btsProject}_${ticketId}`);

export const useIssueInfo = (issue, pluginName) => {
  const userId = useSelector(userIdSelector);
  const projectKey = useSelector(projectKeySelector);
  const projectId = useSelector(projectInfoIdSelector);
  const organizationId = useSelector(activeOrganizationIdSelector);

  const { ticketId, btsProject, btsUrl } = issue;

  const [state, setState] = useState(() => {
    const stored = getStoredIssueData(userId, projectKey, btsProject, ticketId);
    const timeSinceLastExecution = Date.now() - (stored.lastTime || 0);
    const needsFetch = !stored.lastTime || timeSinceLastExecution >= FETCH_ISSUE_INTERVAL;

    return {
      issueInfo: stored.issue || null,
      loading: needsFetch,
      error: false,
    };
  });

  const cancelRequestRef = useRef(() => {});
  const shouldFetchRef = useRef(state.loading);

  const updateIssueInStorage = useCallback(
    (data = {}) => {
      updateCachedTicket(getTicketsStorageKey(userId, projectKey), `${btsProject}_${ticketId}`, data);
    },
    [userId, projectKey, btsProject, ticketId],
  );

  const fetchData = useCallback(() => {
    const cancelRequestFunc = (cancel) => {
      cancelRequestRef.current = cancel;
    };

    setState((prev) => ({ ...prev, loading: true }));

    const url = URLS.pluginsCommandsCommon(pluginName, COMMAND_GET_ISSUE);
    const requestParams = {
      abort: cancelRequestFunc,
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

    fetch(url, requestParams)
      .then((fetchedIssue) => {
        updateIssueInStorage({ issue: fetchedIssue, lastTime: Date.now() });
        setState({ issueInfo: fetchedIssue, loading: false, error: false });
      })
      .catch((err) => {
        if (err.message === ERROR_CANCELED) {
          return;
        }
        updateIssueInStorage({ lastTime: Date.now() });
        setState((prev) => ({ ...prev, loading: false, error: true }));
      });
  }, [
    projectKey,
    btsProject,
    btsUrl,
    pluginName,
    projectId,
    organizationId,
    ticketId,
    updateIssueInStorage,
  ]);

  useEffect(() => {
    if (shouldFetchRef.current) {
      shouldFetchRef.current = false;
      fetchData();
    }

    return () => {
      cancelRequestRef.current();
    };
  }, [fetchData]);

  return state;
};
