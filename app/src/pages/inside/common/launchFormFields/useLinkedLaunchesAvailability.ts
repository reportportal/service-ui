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
import { useSelector } from 'react-redux';
import { isNil } from 'es-toolkit';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { projectKeySelector } from 'controllers/project';
import { MANUAL_LAUNCH_TEST_PLAN_ID_FILTER_KEY } from 'controllers/manualLaunch/constants';

interface LinkedLaunchesAvailability {
  isChecking: boolean;
  hasLinkedLaunches: boolean;
}

interface ManualLaunchesPageResponse {
  page?: { totalElements?: number };
}

interface CheckResult {
  testPlanId: number;
  hasLinkedLaunches: boolean;
}

/**
 * Checks whether at least one Manual Launch is linked to the given Test Plan.
 * Without a Test Plan id nothing is checked and existing launches are treated as available.
 * If the request fails, existing launches stay available.
 */
export const useLinkedLaunchesAvailability = (testPlanId?: number): LinkedLaunchesAvailability => {
  const projectKey = useSelector(projectKeySelector);
  const [result, setResult] = useState<CheckResult | null>(null);

  useEffect(() => {
    if (isNil(testPlanId)) {
      return undefined;
    }

    let isActive = true;
    const saveResult = (hasLinkedLaunches: boolean) => {
      if (isActive) {
        setResult({ testPlanId, hasLinkedLaunches });
      }
    };

    fetch<ManualLaunchesPageResponse>(
      URLS.manualLaunchesListPagination(projectKey, {
        [MANUAL_LAUNCH_TEST_PLAN_ID_FILTER_KEY]: testPlanId,
        limit: 1,
      }),
    )
      .then((response) => saveResult((response?.page?.totalElements ?? 0) > 0))
      .catch(() => saveResult(true));

    return () => {
      isActive = false;
    };
  }, [projectKey, testPlanId]);

  if (isNil(testPlanId)) {
    return { isChecking: false, hasLinkedLaunches: true };
  }

  const isCurrentResult = result?.testPlanId === testPlanId;

  return {
    isChecking: !isCurrentResult,
    hasLinkedLaunches: isCurrentResult ? result.hasLinkedLaunches : true,
  };
};
