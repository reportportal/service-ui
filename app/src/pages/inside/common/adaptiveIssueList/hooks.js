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
import { buildPluginCommandRQ, isPluginCommandForbidden } from 'controllers/plugins/utils';
import { COMMAND_GET_ISSUE } from 'controllers/plugins/uiExtensions/constants';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectInfoIdSelector, projectKeySelector } from 'controllers/project';
import {
  getCachedTicket,
  getTicketsStorageKey,
  updateCachedTicket,
} from 'common/utils/ticketsCache';
import { userIdSelector } from 'controllers/user';
import { userRolesSelector } from 'controllers/pages';
import { canRunPluginCommands } from 'common/utils/permissions';
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
  // Plugin commands need project EDITOR: lower roles get a neutral state without a request.
  const canLoadDetails = canRunPluginCommands(useSelector(userRolesSelector));

  const { ticketId, btsProject, btsUrl } = issue;

  const [state, setState] = useState(() => {
    if (!canLoadDetails) {
      return { issueInfo: null, loading: false, error: false, unavailable: true };
    }
    const stored = getStoredIssueData(userId, projectKey, btsProject, ticketId);
    const timeSinceLastExecution = Date.now() - (stored.lastTime || 0);
    const needsFetch = !stored.lastTime || timeSinceLastExecution >= FETCH_ISSUE_INTERVAL;

    return {
      issueInfo: stored.issue || null,
      loading: needsFetch,
      error: false,
      unavailable: !needsFetch && Boolean(stored.unavailable),
    };
  });

  const cancelRequestRef = useRef(() => {});
  const shouldFetchRef = useRef(state.loading);

  const updateIssueInStorage = useCallback(
    (data = {}) => {
      updateCachedTicket(
        getTicketsStorageKey(userId, projectKey),
        `${btsProject}_${ticketId}`,
        data,
      );
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
        setState({ issueInfo: fetchedIssue, loading: false, error: false, unavailable: false });
      })
      .catch((err) => {
        if (err.message === ERROR_CANCELED) {
          return;
        }
        const unavailable = isPluginCommandForbidden(err);
        updateIssueInStorage({ lastTime: Date.now(), unavailable });
        setState((prev) => ({ ...prev, loading: false, error: !unavailable, unavailable }));
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
