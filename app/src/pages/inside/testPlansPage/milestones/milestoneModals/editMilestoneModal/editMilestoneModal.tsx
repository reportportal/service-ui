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

import { FormEvent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { TmsMilestoneType } from 'controllers/milestone';
import { useModalButtons } from 'hooks/useModalButtons';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { createMilestoneModalMessages } from '../createMilestoneModal/messages';
import { dateOnlyStringToUtcIso, isoToDateOnlyFormValue } from '../../milestoneDateUtils';
import { MilestoneFormModalContent } from '../milestoneFormModalContent';
import type { MilestoneFormValues } from '../createMilestoneModal/types';
import { createValidateMilestoneForm } from '../createMilestoneModal/validateMilestoneForm';
import { EDIT_MILESTONE_FORM_NAME } from './constants';
import type { EditMilestoneModalProps, EditMilestoneOwnProps } from './types';
import { useEditMilestone } from './useEditMilestone';

import styles from '../createMilestoneModal/createMilestoneModal.scss';

const cx = createClassnames(styles);

const EditMilestoneModalForm = ({
  handleSubmit,
  invalid,
  dirty,
  change: onChange,
  milestone,
}: InjectedFormProps<MilestoneFormValues> & EditMilestoneOwnProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, submitMilestone } = useEditMilestone({ milestoneId: milestone.id });

  const onSubmit = (values: MilestoneFormValues) => {
    const startIso = dateOnlyStringToUtcIso(values.startDate.trim());
    const endIso = dateOnlyStringToUtcIso(values.endDate.trim());
    if (!startIso || !endIso) return;

    void submitMilestone({
      name: values.name.trim(),
      type: values.type as TmsMilestoneType,
      status: milestone.status,
      startDate: startIso,
      endDate: endIso,
      testPlans: (milestone.testPlans ?? []).map((plan) => ({ id: plan.id })),
    });
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(createMilestoneModalMessages.saveMilestoneChanges)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid || !dirty,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(createMilestoneModalMessages.editMilestoneModalTitle)}
      okButton={okButton}
      className={cx('create-milestone-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <div className={cx('create-milestone-modal__content')}>
        <ModalLoadingOverlay isVisible={isLoading} />
        <form onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}>
          <MilestoneFormModalContent
            formName={EDIT_MILESTONE_FORM_NAME}
            isLoading={isLoading}
            onChange={onChange}
          />
        </form>
      </div>
    </Modal>
  );
};

const EditMilestoneModalConnected = reduxForm<MilestoneFormValues, EditMilestoneOwnProps>({
  form: EDIT_MILESTONE_FORM_NAME,
  destroyOnUnmount: true,
})(EditMilestoneModalForm);

export const EditMilestoneModal = ({ data }: EditMilestoneModalProps) => {
  const { formatMessage } = useIntl();
  const validate = useMemo(() => createValidateMilestoneForm(formatMessage), [formatMessage]);

  if (!data) {
    return null;
  }

  const initialValues: MilestoneFormValues = {
    name: data.name,
    type: data.type,
    startDate: isoToDateOnlyFormValue(data.startDate),
    endDate: isoToDateOnlyFormValue(data.endDate),
  };

  return (
    <EditMilestoneModalConnected
      key={data.id}
      validate={validate}
      initialValues={initialValues}
      milestone={data}
    />
  );
};
