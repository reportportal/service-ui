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
import { useDispatch } from 'react-redux';

import { getApiErrorMessage } from 'common/utils/apiResponse';
import { showErrorNotification } from 'controllers/notification';

import type { TestPlanDto } from 'controllers/testPlan/types';

import { fetchAllMilestoneTestPlans } from './fetchMilestoneTestPlans';

export const useLaunchTestPlansForAddModal = (projectKey: string) => {
  const [launchTestPlans, setLaunchTestPlans] = useState<TestPlanDto[]>([]);
  const [isLaunchTestPlansLoading, setIsLaunchTestPlansLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!projectKey) {
      setLaunchTestPlans([]);
      setIsLaunchTestPlansLoading(false);

      return;
    }

    setIsLaunchTestPlansLoading(true);
    setLaunchTestPlans([]);

    let isCancelled = false;

    fetchAllMilestoneTestPlans(projectKey)
      .then((plans) => {
        if (!isCancelled) {
          setLaunchTestPlans(plans);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setLaunchTestPlans([]);
          dispatch(
            showErrorNotification({
              message: getApiErrorMessage(error),
              messageId: getApiErrorMessage(error) ? '' : 'errorOccurredTryAgain',
            }),
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLaunchTestPlansLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [projectKey, dispatch]);

  return { launchTestPlans, isLaunchTestPlansLoading };
};
