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

import { useSelector } from 'react-redux';

import { BaseAppState, TestPlanAppState, TestCaseAppState, AppState } from 'types/store';
import { testPlanByIdSelector } from 'controllers/testPlan';

export const useBaseSelector = <T>(selector: (state: BaseAppState) => T): T =>
  useSelector<BaseAppState, T>(selector);

export const useTestPlanSelector = <T>(selector: (state: TestPlanAppState) => T): T =>
  useSelector<TestPlanAppState, T>(selector);

export const useTestCaseSelector = <T>(selector: (state: TestCaseAppState) => T): T =>
  useSelector<TestCaseAppState, T>(selector);

export const useFullSelector = <T>(selector: (state: AppState) => T): T =>
  useSelector<AppState, T>(selector);

export const useProjectDetails = () =>
  useBaseSelector((state) => state.location?.payload) || {
    organizationSlug: '',
    projectSlug: '',
    projectId: 0,
    projectName: '',
    projectKey: '',
    projectRole: '',
  };

export const useTestPlanId = () =>
  useBaseSelector((state) => state.location?.payload?.testPlanId) || '';

export const useTestCaseId = () =>
  useBaseSelector((state) => state.location?.payload?.testCaseId) || '';

export const useUserInfo = () => useFullSelector((state) => state.user?.info);

export const useUserSettings = () => useFullSelector((state) => state.user?.settings);

export const useActiveProject = () => useFullSelector((state) => state.user?.activeProject) || '';

export const useNotifications = () => useFullSelector((state) => state.notifications || []);

export const useActiveModal = () => useFullSelector((state) => state.modal?.activeModal);

export const useTestPlans = () => useTestPlanSelector((state) => state.testPlan?.data || []);

export const useActiveTestPlan = () =>
  useTestPlanSelector((state) => state.testPlan?.activeTestPlan);

export const useTestPlanLoading = () =>
  useTestPlanSelector((state) => state.testPlan?.isLoading || false);

export const useActiveTestPlanLoading = () =>
  useTestPlanSelector((state) => state.testPlan?.isLoadingActive || false);

export const useTestPlanById = (testPlanId: string) =>
  useTestPlanSelector(testPlanByIdSelector(testPlanId));
