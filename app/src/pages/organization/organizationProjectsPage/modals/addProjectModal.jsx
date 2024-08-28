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
import { messages } from '../messages';

const PROJECT_NAME_FIELD = 'projectName';
export const AddProjectModal = ({ data = {}, handleSubmit }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { onSubmit } = data;

  const onCreateProject = ({ projectName }) => {
    onSubmit(projectName);
  };
  const hideModal = () => dispatch(hideModalAction());

  return (
    <Modal
      title={formatMessage(messages.addProject)}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        onClick: () => {
          handleSubmit(onCreateProject)();
        },
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={hideModal}
    >
      <FieldProvider name={PROJECT_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.projectNameLabel)}
            defaultWidth={false}
            placeholder={formatMessage(messages.projectNamePlaceholder)}
            maxLength={Infinity}
          />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

AddProjectModal.propTypes = {
  data: PropTypes.object,
  handleSubmit: PropTypes.func,
};

export default withModal('addProjectModal')(
  reduxForm({
    form: 'addProjectForm',
    validate: ({ projectName }) => {
      const trimmedProjectName = projectName?.trim();
      return {
        projectName: commonValidators.createProjectNameValidator()(trimmedProjectName),
      };
    },
  })(AddProjectModal),
);
