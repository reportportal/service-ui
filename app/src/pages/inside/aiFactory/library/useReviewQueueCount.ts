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

import { useEffect, useState } from 'react';

import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils';
import type { Page } from 'types/common';
import { Lifecycle } from 'types/aiFactory';

interface ReviewQueueResponse {
  page?: Page;
}

interface ReviewQueueCountState {
  count?: number;
  requestKey: string;
}

const INITIAL_STATE: ReviewQueueCountState = {
  count: undefined,
  requestKey: '',
};

const getTotalElements = ({ page }: ReviewQueueResponse): number | undefined => {
  const totalElements = page?.totalElements;

  return Number.isSafeInteger(totalElements) && Number(totalElements) >= 0
    ? totalElements
    : undefined;
};

export const useReviewQueueCount = (
  projectKey: string,
  isEnabled: boolean,
  refreshRevision = 1,
): number | undefined => {
  const [state, setState] = useState<ReviewQueueCountState>(INITIAL_STATE);
  const requestKey =
    isEnabled && projectKey && refreshRevision > 0 ? `${projectKey}:${refreshRevision}` : '';

  useEffect(() => {
    if (!requestKey) {
      return undefined;
    }

    let isActive = true;
    let cancelRequest = () => {};

    void fetch<ReviewQueueResponse>(
      URLS.testCases(projectKey, {
        limit: 1,
        'filter.eq.lifecycle': Lifecycle.DRAFT,
        'filter.eq.ai': true,
      }),
      {
        abort: (cancel) => {
          cancelRequest = cancel;
        },
      },
    )
      .then((response) => {
        if (!isActive) {
          return;
        }

        setState({ count: getTotalElements(response), requestKey });
      })
      .catch((error: unknown) => {
        if (!isActive || (error instanceof Error && error.message === ERROR_CANCELED)) {
          return;
        }

        setState({ count: undefined, requestKey });
      });

    return () => {
      isActive = false;
      cancelRequest();
    };
  }, [projectKey, requestKey]);

  return state.requestKey === requestKey ? state.count : undefined;
};
