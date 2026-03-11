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
import { activeProjectSelector } from 'controllers/user';
import { pluginByNameSelector, isPluginSupportsCommonCommand } from 'controllers/plugins';
import { COMMAND_GET_ISSUE } from 'controllers/plugins/uiExtensions/constants';
import { projectInfoIdSelector } from 'controllers/project/selectors';
import { getStorageItem, updateStorageItem } from 'common/utils';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';

const FETCH_ISSUE_INTERVAL = 900000; // 15 min

const getStorageKey = (activeProject) => `${activeProject}_tickets`;

const getStoredIssueData = (activeProject, btsProject, ticketId) => {
  const storageKey = getStorageKey(activeProject);
  const data = getStorageItem(storageKey) || {};
  return data[`${btsProject}_${ticketId}`] || {};
};

export const useIssueInfo = (issue, pluginName) => {
  const activeProject = useSelector(activeProjectSelector);
  const projectId = useSelector(projectInfoIdSelector);
  const plugin = useSelector((state) => pluginByNameSelector(state, pluginName));

  const { ticketId, btsProject, btsUrl } = issue;

  const [state, setState] = useState(() => {
    const stored = getStoredIssueData(activeProject, btsProject, ticketId);
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
      const storageKey = getStorageKey(activeProject);
      updateStorageItem(storageKey, { [`${btsProject}_${ticketId}`]: data });
    },
    [activeProject, btsProject, ticketId],
  );

  const fetchData = useCallback(() => {
    const cancelRequestFunc = (cancel) => {
      cancelRequestRef.current = cancel;
    };

    setState((prev) => ({ ...prev, loading: true }));

    const isCommonCommandSupported =
      plugin && isPluginSupportsCommonCommand(plugin, COMMAND_GET_ISSUE);
    let url;
    let data;

    if (isCommonCommandSupported) {
      url = URLS.pluginCommandCommon(activeProject, plugin.name, COMMAND_GET_ISSUE);
      data = {
        ticketId,
        url: btsUrl,
        project: btsProject,
        projectId,
      };
    } else {
      url = URLS.btsTicket(activeProject, ticketId, btsProject, btsUrl);
    }

    fetch(url, {
      method: isCommonCommandSupported ? 'PUT' : 'GET',
      data,
      abort: cancelRequestFunc,
    })
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
  }, [activeProject, btsProject, btsUrl, plugin, projectId, ticketId, updateIssueInStorage]);

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
