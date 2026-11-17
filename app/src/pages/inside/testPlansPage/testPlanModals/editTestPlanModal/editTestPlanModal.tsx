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
import { isNotNil } from 'es-toolkit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import type { TestPlanDto } from 'controllers/testPlan/types';

import { TestPlanModal, TestPlanFormValues } from '../testPlanModal';
import { commonMessages } from '../../commonMessages';
import { useEditTestPlan } from './useEditTestPlan';
import { buildEditedFieldsCondition } from './utils';

export const EDIT_TEST_PLAN_MODAL_KEY = 'editTestPlanModalKey';

export interface EditTestPlanSubmitMeta {
  attributesCount: number;
  editedFieldsCondition: string;
}

interface EditTestPlanModalProps {
  data: TestPlanDto;
  onSubmitSuccess?: (meta: EditTestPlanSubmitMeta) => void;
}

export const EditTestPlanModal = ({ data, onSubmitSuccess }: EditTestPlanModalProps) => {
  const { formatMessage } = useIntl();
  const initialValues = {
    name: data.name,
    description: data.description,
    attributes: data.attributes || [],
  };
  const { isLoading, submitTestPlan } = useEditTestPlan({
    onSubmitSuccess: onSubmitSuccess
      ? (submittedValues, attributesCount) =>
          onSubmitSuccess({
            attributesCount,
            editedFieldsCondition: buildEditedFieldsCondition(initialValues, submittedValues),
          })
      : undefined,
  });

  const handleSubmit = async (formValues: TestPlanFormValues) => {
    const payload = {
      ...formValues,
      id: data.id,
      ...(isNotNil(data.milestoneId) ? { milestoneId: data.milestoneId } : {}),
    };

    return submitTestPlan(payload);
  };

  return (
    <TestPlanModal
      title={formatMessage(commonMessages.editTestPlan)}
      submitButtonText={formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      isLoading={isLoading}
      formName="edit-test-plan-modal-form"
      initialValues={initialValues}
      requiresChanges
      onSubmit={handleSubmit}
    />
  );
};
