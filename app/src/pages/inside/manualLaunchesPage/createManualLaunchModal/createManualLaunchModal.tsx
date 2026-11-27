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

import { FormEvent, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { INCOMPLETE_ATTRIBUTE_ERROR } from 'common/utils/validation/constants';
import { useTextareaAutoResize } from 'common/hooks';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useModalButtons } from 'hooks/useModalButtons';
import { NewLaunchFields } from 'pages/inside/common/launchFormFields/newLaunchFields';
import { INITIAL_LAUNCH_FORM_VALUES } from 'pages/inside/common/launchFormFields/constants';
import { Attribute, LaunchFormData } from 'pages/inside/common/launchFormFields/types';

import { useCreateManualLaunchFromList } from './useCreateManualLaunchFromList';
import { CreateManualLaunchModalProps } from './types';
import { CREATE_MANUAL_LAUNCH_FORM } from './constants';
import { messages } from './messages';

import styles from './createManualLaunchModal.scss';

const cx = createClassnames(styles);

const CreateManualLaunchModalComponent = ({
  onSuccess,
  handleSubmit,
  invalid,
  anyTouched,
  submitFailed,
  dirty,
}: CreateManualLaunchModalProps &
  InjectedFormProps<LaunchFormData, CreateManualLaunchModalProps>) => {
  const { formatMessage } = useIntl();
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useTextareaAutoResize(descriptionRef);

  const { handleSubmit: handleCreateLaunch, isLoading } = useCreateManualLaunchFromList(onSuccess);

  const onSubmit = useMemo(
    () => (formValues: LaunchFormData) => {
      handleCreateLaunch(formValues).catch(noop);
    },
    [handleCreateLaunch],
  );

  // Create is enabled on open; it is disabled once a submit or a touched field shows an error.
  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid && (anyTouched || submitFailed),
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(messages.createLaunch)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
      className={cx('create-manual-launch-modal')}
      scrollable
    >
      <form
        onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}
        className={cx('create-manual-launch-modal__form')}
      >
        <NewLaunchFields
          descriptionPlaceholder={formatMessage(messages.descriptionPlaceholder)}
          testPlanPlaceholder={formatMessage(messages.testPlanPlaceholder)}
          testPlanHint={formatMessage(messages.testPlanHint)}
          descriptionRef={descriptionRef}
          testPlanMenuClassName={cx('test-plan-menu')}
        />
      </form>
    </Modal>
  );
};

export const CreateManualLaunchModal = reduxForm<LaunchFormData, CreateManualLaunchModalProps>({
  form: CREATE_MANUAL_LAUNCH_FORM,
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
  validate: ({ attributes }) => {
    const errors: Partial<Record<keyof LaunchFormData, string>> = {};

    // An attribute that is still being edited blocks the submit.
    if (Array.isArray(attributes) && attributes.some((attr: Attribute) => attr.edited)) {
      errors.attributes = INCOMPLETE_ATTRIBUTE_ERROR;
    }

    return errors;
  },
})(CreateManualLaunchModalComponent);
