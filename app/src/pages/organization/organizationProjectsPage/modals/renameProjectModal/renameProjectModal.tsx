/*!
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

import { FC, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { ModalButtonProps } from 'types/common';
import { useDispatch } from 'react-redux';
import { messages } from '../../messages';

const PROJECT_NAME_FIELD = 'newProjectName';
const RENAME_PROJECT_FORM = 'renameProjectForm';

interface RenameProjectFormProps {
  [PROJECT_NAME_FIELD]: string;
}

interface ModalProps {
  data: {
    onConfirm: (newProjectName: string) => void;
    projectName: string;
  };
}

type RenameProjectModalProps = InjectedFormProps<RenameProjectFormProps, ModalProps> & ModalProps;

const RenameProjectModal: FC<RenameProjectModalProps> = ({
  data: { onConfirm, projectName },
  initialize,
  handleSubmit,
  anyTouched,
  invalid,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  useEffect(() => {
    initialize({ [PROJECT_NAME_FIELD]: projectName });
  }, [initialize, projectName]);

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = (formData: RenameProjectFormProps) => {
    const newProjectName = formData[PROJECT_NAME_FIELD]?.trim();
    onConfirm(newProjectName);
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.RENAME),
    onClick: handleSubmit(onSubmit),
    disabled: anyTouched && invalid,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.renameProject)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <FieldProvider name={PROJECT_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText label={formatMessage(messages.projectNameLabel)} defaultWidth={false} />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

export default reduxForm<RenameProjectFormProps, ModalProps>({
  form: RENAME_PROJECT_FORM,
  validate: (values) => {
    const newProjectName = values[PROJECT_NAME_FIELD]?.trim();
    const projectNameValidator = commonValidators.createProjectNameValidator();

    return {
      [PROJECT_NAME_FIELD]: projectNameValidator(newProjectName),
    };
  },
})(RenameProjectModal);
