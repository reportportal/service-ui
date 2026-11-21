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

import { projectKeySelector } from 'controllers/project';
import { hasMilestoneTestPlans } from 'pages/inside/testCaseLibraryPage/addTestCasesToTestPlanModal/fetchMilestoneTestPlans';

// The "Add to Test Plan" modal only lets a user pick from test plans that are
// linked to a milestone (see useLaunchTestPlansForAddModal / fetchAllMilestoneTestPlans),
// since a test plan can exist without any milestone. This cache must check the same
// source, otherwise the button could be enabled while the modal's dropdown is empty.
// Linking a plan to a milestone elsewhere (e.g. "Edit test plan") does not reset the cache, so the
// answer expires after a short time and is re-checked on the next mount.
export const HAS_TEST_PLANS_CACHE_TTL = 10 * 1000;

let cachedProjectKey: string | null = null;
let cachedPromise: Promise<boolean> | null = null;
let cachedAt = 0;

export const getHasTestPlansPromise = (projectKey: string): Promise<boolean> => {
  if (
    cachedProjectKey === projectKey &&
    cachedPromise !== null &&
    Date.now() - cachedAt < HAS_TEST_PLANS_CACHE_TTL
  ) {
    return cachedPromise;
  }

  cachedProjectKey = projectKey;
  cachedAt = Date.now();
  cachedPromise = hasMilestoneTestPlans(projectKey).catch(() => {
    cachedProjectKey = null;
    cachedPromise = null;
    return false;
  });

  return cachedPromise;
};

export const resetHasTestPlansCache = () => {
  cachedProjectKey = null;
  cachedPromise = null;
};

export const useHasTestPlans = () => {
  const projectKey = useSelector(projectKeySelector);
  const [hasTestPlans, setHasTestPlans] = useState(false);
  const [isCheckingTestPlansExistence, setIsCheckingTestPlansExistence] = useState(true);

  useEffect(() => {
    if (!projectKey) {
      setHasTestPlans(false);
      setIsCheckingTestPlansExistence(false);
      return;
    }

    let isCancelled = false;
    setHasTestPlans(false);
    setIsCheckingTestPlansExistence(true);

    getHasTestPlansPromise(projectKey).then((result) => {
      if (!isCancelled) {
        setHasTestPlans(result);
        setIsCheckingTestPlansExistence(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [projectKey]);

  return { hasTestPlans, isCheckingTestPlansExistence };
};
