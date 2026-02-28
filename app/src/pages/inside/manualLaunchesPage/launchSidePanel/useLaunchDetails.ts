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

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { showErrorNotification } from 'controllers/notification';
import { useDebouncedSpinner } from 'common/hooks';

import { ManualLaunchItem } from '../types';

export const useLaunchDetails = (launchId: number | null) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const [launchDetails, setLaunchDetails] = useState<ManualLaunchItem | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);

  const refetchLaunchDetails = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!launchId) {
      setLaunchDetails(null);
      return;
    }

    const abortController = new AbortController();

    const fetchLaunchDetails = async () => {
      try {
        showSpinner();

        const response = await fetch<ManualLaunchItem>(
          URLS.manualLaunchById(projectKey, launchId),
          { signal: abortController.signal },
        );

        if (abortController.signal.aborted) {
          return;
        }

        setLaunchDetails(response);
      } catch {
        if (abortController.signal.aborted) {
          return;
        }

        dispatch(
          showErrorNotification({
            messageId: 'errorOccurredTryAgain',
          }),
        );
      } finally {
        if (!abortController.signal.aborted) {
          hideSpinner();
        }
      }
    };

    void fetchLaunchDetails();

    return () => {
      abortController.abort();
    };
  }, [projectKey, launchId, dispatch, refetchTrigger, hideSpinner, showSpinner]);

  return {
    launchDetails,
    isLoading,
    refetchLaunchDetails,
  };
};
