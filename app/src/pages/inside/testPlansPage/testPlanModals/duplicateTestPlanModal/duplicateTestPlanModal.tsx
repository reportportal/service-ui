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

import { useIntl } from 'react-intl';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { TestPlanDto } from 'controllers/testPlan';

import { TestPlanModal } from '../testPlanModal';
import { commonMessages } from '../../commonMessages';
import { useDuplicateTestPlan } from './useDuplicateTestPlan';

export const DUPLICATE_TEST_PLAN_MODAL_KEY = 'duplicateTestPlanModalKey';

interface DuplicateTestPlanModalProps {
  data: TestPlanDto;
  onSuccess?: (testPlanId: number) => void;
}

export const DuplicateTestPlanModal = ({ data, onSuccess }: DuplicateTestPlanModalProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, duplicateTestPlan } = useDuplicateTestPlan({
    testPlanId: data.id,
    onSuccess,
  });

  return (
    <TestPlanModal
      title={formatMessage(commonMessages.duplicateTestPlan)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.DUPLICATE)}
      isLoading={isLoading}
      formName="duplicate-test-plan-modal-form"
      initialValues={{
        name: `${data.name} (1)`,
        description: data.description,
        attributes: [],
      }}
      onSubmit={duplicateTestPlan}
    />
  );
};
