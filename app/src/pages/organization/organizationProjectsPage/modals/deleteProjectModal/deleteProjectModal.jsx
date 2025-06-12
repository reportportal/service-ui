/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { messages } from '../../messages';
import styles from './deleteProjectModal.scss';

const cx = classNames.bind(styles);

const PROJECT_NAME_FIELD = 'projectName';
const DELETE_PROJECT_FORM = 'deleteProjectForm';

export const DeleteProjectModal = ({
  data: { onSave, projectDetails },
  handleSubmit,
  anyTouched,
  invalid,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const hideModal = () => dispatch(hideModalAction());
  const handleDelete = () => {
    const { projectId, projectName } = projectDetails;
    onSave({ projectId, projectName });
  };

  return (
    <Modal
      title={'Delete Project'}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        onClick: () => {
          handleSubmit(handleDelete)();
        },
        variant: 'danger',
        disabled: anyTouched && invalid,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={hideModal}
    >
      <p className={cx('message')}>
        {formatMessage(messages.confirmDeleteProjectMessage, {
          projectName: projectDetails?.projectName,
        })}
      </p>
      <FieldProvider name={PROJECT_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.confirmProjectNameEntry)}
            defaultWidth={false}
            placeholder={formatMessage(messages.projectName)}
            maxLength={Infinity}
          />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

DeleteProjectModal.propTypes = {
  data: PropTypes.object,
  handleSubmit: PropTypes.func,
  anyTouched: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
};

export default withModal('deleteProjectModal')(
  reduxForm({
    form: DELETE_PROJECT_FORM,
    validate: ({ projectName: inputProjectValue }, { data: { projectDetails } }) => {
      return {
        projectName: commonValidators.createKeywordMatcherValidator(projectDetails.projectName)(
          inputProjectValue,
        ),
      };
    },
  })(DeleteProjectModal),
);
