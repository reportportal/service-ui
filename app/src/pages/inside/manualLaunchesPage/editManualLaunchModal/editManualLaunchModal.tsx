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

import { useMemo, FC } from 'react';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { LaunchFormData } from 'pages/inside/common/launchFormFields/types';
import { NewLaunchFields } from 'pages/inside/common/launchFormFields/newLaunchFields';
import { LAUNCH_FORM_FIELD_NAMES } from 'pages/inside/common/launchFormFields/constants';
import { useModalButtons } from 'pages/inside/testCaseLibraryPage/hooks/useModalButtons';

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
}: EditManualLaunchModalProps & InjectedFormProps<LaunchFormData, EditManualLaunchModalProps>) => {
  const { formatMessage } = useIntl();

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
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(messages.editLaunch)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
      className={cx('edit-manual-launch-modal')}
    >
      <form className={cx('edit-launch-form')}>
        <NewLaunchFields
          hideTestPlanField={false}
          descriptionPlaceholder={formatMessage(messages.descriptionPlaceholder)}
          testPlanPlaceholder={formatMessage(messages.testPlanPlaceholder)}
        />
      </form>
    </Modal>
  );
};

const EditManualLaunchModalReduxForm = reduxForm<LaunchFormData, EditManualLaunchModalProps>({
  form: EDIT_MANUAL_LAUNCH_FORM,
  destroyOnUnmount: true,
  enableReinitialize: true,
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
