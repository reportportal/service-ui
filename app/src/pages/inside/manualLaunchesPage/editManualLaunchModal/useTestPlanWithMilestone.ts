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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import type { TestPlanOption } from 'pages/inside/common/launchFormFields/types';

/**
 * The launch response has only the id and name of its Test Plan. Loads the Test Plan to add its
 * Milestone, so the field shows "Plan name, Milestone name". Keeps the given value if the request
 * fails or the API returns no Milestone name.
 */
export const useTestPlanWithMilestone = (testPlan?: TestPlanOption | null) => {
  const projectKey = useSelector(projectKeySelector);
  const [testPlanWithMilestone, setTestPlanWithMilestone] = useState(testPlan ?? null);
  const testPlanId = testPlan?.id;

  useEffect(() => {
    setTestPlanWithMilestone(testPlan ?? null);

    if (!testPlanId || testPlan?.milestone?.name) {
      return undefined;
    }

    let isActual = true;

    fetch<TestPlanOption>(URLS.testPlanById(projectKey, testPlanId))
      .then((response) => {
        if (isActual && response?.milestone?.name) {
          setTestPlanWithMilestone({ ...testPlan, milestone: response.milestone });
        }
      })
      .catch(() => {});

    return () => {
      isActual = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey, testPlanId]);

  return testPlanWithMilestone;
};
