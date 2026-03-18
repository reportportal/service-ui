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

import { useMemo, FC, useRef } from 'react';
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
import { LaunchFormData, Attribute } from 'pages/inside/common/launchFormFields/types';
import { NewLaunchFields } from 'pages/inside/common/launchFormFields/newLaunchFields';
import { LAUNCH_FORM_FIELD_NAMES } from 'pages/inside/common/launchFormFields/constants';
import { useModalButtons } from 'hooks/useModalButtons';

import { useEditManualLaunch } from './useEditManualLaunch';
import { EditManualLaunchModalProps } from './types';
import { messages } from './messages';
import { EDIT_MANUAL_LAUNCH_FORM } from './constants';

import styles from './editManualLaunchModal.scss';

const cx = createClassnames(styles);

const EditManualLaunchModalComponent = ({
  data,
  onSuccess = noop,
  handleSubmit,
  invalid,
  pristine,
  dirty,
}: EditManualLaunchModalProps & InjectedFormProps<LaunchFormData, EditManualLaunchModalProps>) => {
  const { formatMessage } = useIntl();
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useTextareaAutoResize(descriptionRef);

  const { handleSubmit: handleEditLaunch, isLoading } = useEditManualLaunch({
    launchId: data.id,
    onSuccess,
  });

  const onSubmit = useMemo(
    () => (formValues: LaunchFormData) => {
      handleEditLaunch(formValues).catch(noop);
    },
    [handleEditLaunch],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid || pristine,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(messages.editLaunch)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
      className={cx('edit-manual-launch-modal')}
      scrollable
    >
      <form
        onSubmit={handleSubmit(onSubmit) as (event: React.FormEvent) => void}
        className={cx('edit-manual-launch-modal__form')}
      >
        <NewLaunchFields
          hideTestPlanField={false}
          descriptionPlaceholder={formatMessage(messages.descriptionPlaceholder)}
          testPlanPlaceholder={formatMessage(messages.testPlanPlaceholder)}
          descriptionRef={descriptionRef}
          testPlanMenuClassName="test-plan-dropdown"
          autocompleteProps={{
            useFixedPositioning: true,
            keyMenuClassName: 'attribute-key-dropdown',
            valueMenuClassName: 'attribute-value-dropdown',
          }}
        />
      </form>
    </Modal>
  );
};

const EditManualLaunchModalReduxForm = reduxForm<LaunchFormData, EditManualLaunchModalProps>({
  form: EDIT_MANUAL_LAUNCH_FORM,
  destroyOnUnmount: true,
  enableReinitialize: true,
  validate: (values) => {
    const errors: Partial<Record<keyof LaunchFormData, string>> = {};

    // Disable Save button if any attribute is being edited (incomplete)
    if (Array.isArray(values.attributes)) {
      const hasIncompleteAttribute = values.attributes.some((attr: Attribute) => attr.edited);
      if (hasIncompleteAttribute) {
        errors.attributes = INCOMPLETE_ATTRIBUTE_ERROR as string;
      }
    }

    return errors;
  },
})(EditManualLaunchModalComponent);

export const EditManualLaunchModal: FC<EditManualLaunchModalProps> = (props) => {
  const initialValues = useMemo(
    () => ({
      [LAUNCH_FORM_FIELD_NAMES.NAME]: props.data.name,
      [LAUNCH_FORM_FIELD_NAMES.DESCRIPTION]: props.data.description || '',
      [LAUNCH_FORM_FIELD_NAMES.TEST_PLAN]: props.data.testPlan || null,
      [LAUNCH_FORM_FIELD_NAMES.ATTRIBUTES]: props.data.attributes || [],
    }),
    [props.data],
  );

  return <EditManualLaunchModalReduxForm {...props} initialValues={initialValues} />;
};
