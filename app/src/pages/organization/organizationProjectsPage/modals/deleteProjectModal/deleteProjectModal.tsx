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

import { FC } from 'react';
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
import classNames from 'classnames/bind';
import { messages } from '../../messages';
import styles from './deleteProjectModal.scss';

const cx = classNames.bind(styles) as typeof classNames;

const PROJECT_NAME_FIELD = 'projectName';
const DELETE_PROJECT_FORM = 'deleteProjectForm';

interface DeleteProjectFormProps {
  [PROJECT_NAME_FIELD]: string;
}

interface ModalProps {
  data: {
    onConfirm: () => void;
    projectName: string;
  };
}

type DeleteProjectModalProps = InjectedFormProps<DeleteProjectFormProps, ModalProps> & ModalProps;

const DeleteProjectModal: FC<DeleteProjectModalProps> = ({
  data: { onConfirm, projectName },
  handleSubmit,
  anyTouched,
  invalid,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const hideModal = () => dispatch(hideModalAction());

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    // @Alla_Prischepa check it please
    onClick: () => handleSubmit(onConfirm) as void,
    variant: 'danger',
    disabled: anyTouched && invalid,
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <Modal
      title={formatMessage(messages.deleteProject)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <p className={cx('message')}>
        {formatMessage(messages.confirmDeleteProjectMessage, { projectName })}
      </p>
      <FieldProvider name={PROJECT_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.confirmProjectNameEntry)}
            defaultWidth={false}
            placeholder={formatMessage(messages.projectName)}
          />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

export default reduxForm<DeleteProjectFormProps, ModalProps>({
  form: DELETE_PROJECT_FORM,
  validate: ({ projectName: inputProjectValue }, { data: { projectName } }) => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- @Alla_Prischepa update after `validation` migrated to TS
      projectName: commonValidators.createKeywordMatcherValidator(projectName)(inputProjectValue),
    };
  },
})(DeleteProjectModal);
