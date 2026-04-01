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
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MilestoneStatus, TmsMilestoneType } from 'controllers/milestone';
import { useModalButtons } from 'hooks/useModalButtons';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { CREATE_MILESTONE_FORM_NAME, INITIAL_MILESTONE_FORM_VALUES } from './constants';
import { createMilestoneModalMessages } from './messages';
import { dateOnlyStringToUtcIso } from '../../milestoneDateUtils';
import { MilestoneFormModalContent } from '../milestoneFormModalContent';
import type { MilestoneFormValues } from './types';
import { useCreateMilestone } from './useCreateMilestone';
import { createValidateMilestoneForm } from './validateMilestoneForm';

import styles from './createMilestoneModal.scss';

const cx = createClassnames(styles);

type FormProps = InjectedFormProps<MilestoneFormValues>;

const CreateMilestoneModalForm = ({
  handleSubmit,
  invalid,
  dirty,
  change: onChange,
}: FormProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, submitMilestone } = useCreateMilestone();

  const onSubmit = (values: MilestoneFormValues) => {
    const startIso = dateOnlyStringToUtcIso(values.startDate.trim());
    const endIso = dateOnlyStringToUtcIso(values.endDate.trim());
    if (!startIso || !endIso) return;

    void submitMilestone({
      name: values.name.trim(),
      type: values.type as TmsMilestoneType,
      status: MilestoneStatus.SCHEDULED,
      startDate: startIso,
      endDate: endIso,
    });
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(createMilestoneModalMessages.createMilestoneModalTitle)}
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
            formName={CREATE_MILESTONE_FORM_NAME}
            isLoading={isLoading}
            onChange={onChange}
          />
        </form>
      </div>
    </Modal>
  );
};

const CreateMilestoneModalRedux = reduxForm<MilestoneFormValues>({
  form: CREATE_MILESTONE_FORM_NAME,
  initialValues: INITIAL_MILESTONE_FORM_VALUES,
  destroyOnUnmount: true,
})(CreateMilestoneModalForm);

export const CreateMilestoneModal = () => {
  const { formatMessage } = useIntl();
  const validate = useMemo(() => createValidateMilestoneForm(formatMessage), [formatMessage]);

  return <CreateMilestoneModalRedux validate={validate} />;
};
