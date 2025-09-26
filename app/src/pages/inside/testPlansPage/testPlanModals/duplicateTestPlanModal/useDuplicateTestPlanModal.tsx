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

import { noop } from 'lodash';

import { TestPlanDto } from 'controllers/testPlan';
import { useModal } from 'common/hooks';

import { DUPLICATE_TEST_PLAN_MODAL_KEY, DuplicateTestPlanModal } from './duplicateTestPlanModal';

interface UseDuplicateTestPlanModalOptions {
  onSuccess?: (testPlanId: number) => void;
}

export const useDuplicateTestPlanModal = ({
  onSuccess = noop,
}: UseDuplicateTestPlanModalOptions = {}) =>
  useModal<TestPlanDto>({
    modalKey: DUPLICATE_TEST_PLAN_MODAL_KEY,
    renderModal: (data) => <DuplicateTestPlanModal data={data} onSuccess={onSuccess} />,
  });
