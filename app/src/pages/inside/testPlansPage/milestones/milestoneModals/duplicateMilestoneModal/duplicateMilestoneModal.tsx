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
import { Modal, SystemMessage } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MilestoneStatus, TmsMilestoneType } from 'controllers/milestone';
import { useModalButtons } from 'hooks/useModalButtons';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { createMilestoneModalMessages } from '../createMilestoneModal/messages';
import { dateOnlyStringToUtcIso, isoToDateOnlyFormValue } from '../../milestoneDateUtils';
import { MilestoneFormModalContent } from '../milestoneFormModalContent';
import type { MilestoneFormValues } from '../createMilestoneModal/types';
import { createValidateMilestoneForm } from '../createMilestoneModal/validateMilestoneForm';
import { DUPLICATE_MILESTONE_FORM_NAME } from './constants';
import type { DuplicateMilestoneModalProps, DuplicateMilestoneOwnProps } from './types';
import { useDuplicateMilestone } from './useDuplicateMilestone';
import { getNextDuplicateMilestoneName } from './utils';

import createStyles from '../createMilestoneModal/createMilestoneModal.scss';
import styles from './duplicateMilestoneModal.scss';

const cx = createClassnames(styles);
const cxCreate = createClassnames(createStyles);

const DuplicateMilestoneModalForm = ({
  handleSubmit,
  invalid,
  dirty,
  change: onChange,
  sourceMilestone,
}: InjectedFormProps<MilestoneFormValues> & DuplicateMilestoneOwnProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, submitDuplicate } = useDuplicateMilestone({
    sourceMilestoneId: sourceMilestone.id,
  });

  const onSubmit = (values: MilestoneFormValues) => {
    const startIso = dateOnlyStringToUtcIso(values.startDate.trim());
    const endIso = dateOnlyStringToUtcIso(values.endDate.trim());
    if (!startIso || !endIso) return;

    void submitDuplicate({
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
        {formatMessage(COMMON_LOCALE_KEYS.DUPLICATE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(createMilestoneModalMessages.duplicateMilestoneModalTitle)}
      okButton={okButton}
      className={cxCreate('create-milestone-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <div className={cx('duplicate-milestone-modal')}>
        <div className={cx('duplicate-milestone-modal__notice')}>
          <SystemMessage
            mode="info"
            header={formatMessage(createMilestoneModalMessages.duplicateMilestoneInfoTitle)}
          >
            {formatMessage(createMilestoneModalMessages.duplicateMilestoneInfoBody)}
          </SystemMessage>
        </div>
        <div className={cxCreate('create-milestone-modal__content')}>
          <ModalLoadingOverlay isVisible={isLoading} />
          <form onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}>
            <MilestoneFormModalContent
              formName={DUPLICATE_MILESTONE_FORM_NAME}
              isLoading={isLoading}
              onChange={onChange}
            />
          </form>
        </div>
      </div>
    </Modal>
  );
};

const DuplicateMilestoneModalConnected = reduxForm<MilestoneFormValues, DuplicateMilestoneOwnProps>(
  {
    form: DUPLICATE_MILESTONE_FORM_NAME,
    destroyOnUnmount: true,
  },
)(DuplicateMilestoneModalForm);

export const DuplicateMilestoneModal = ({ data }: DuplicateMilestoneModalProps) => {
  const { formatMessage } = useIntl();
  const validate = useMemo(() => createValidateMilestoneForm(formatMessage), [formatMessage]);

  if (!data) {
    return null;
  }

  const initialValues: MilestoneFormValues = {
    name: getNextDuplicateMilestoneName(data.name),
    type: data.type,
    startDate: isoToDateOnlyFormValue(data.startDate),
    endDate: isoToDateOnlyFormValue(data.endDate),
  };

  return (
    <DuplicateMilestoneModalConnected
      key={data.id}
      validate={validate}
      initialValues={initialValues}
      sourceMilestone={data}
    />
  );
};
