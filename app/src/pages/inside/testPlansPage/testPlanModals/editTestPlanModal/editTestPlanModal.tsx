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

import { TestPlanModal, TestPlanFormValues } from '../testPlanModal';
import { commonMessages } from '../../commonMessages';
import { useEditTestPlan } from './useEditTestPlan';

export const EDIT_TEST_PLAN_MODAL_KEY = 'editTestPlanModalKey';

interface EditTestPlanModalProps {
  data: TestPlanDto;
}

export const EditTestPlanModal = ({ data }: EditTestPlanModalProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, submitTestPlan } = useEditTestPlan();

  const handleSubmit = async (formValues: TestPlanFormValues) => {
    const payload = {
      ...formValues,
      id: data.id,
    };

    return submitTestPlan(payload);
  };

  return (
    <TestPlanModal
      title={formatMessage(commonMessages.editTestPlan)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      isLoading={isLoading}
      formName="edit-test-plan-modal-form"
      initialValues={{
        name: data.name,
        description: data.description,
        attributes: [],
      }}
      requiresChanges
      onSubmit={handleSubmit}
    />
  );
};
