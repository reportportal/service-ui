/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { Input } from 'components/inputs/input';
import { validate, bindMessageToValidator, validateAsync } from 'common/utils/validation';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { SectionHeader } from 'components/main/sectionHeader';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages } from './../messages';

const LABEL_WIDTH = 105;

@withModal('addProjectModal')
@injectIntl
@reduxForm({
  form: 'addProjectForm',
  validate: ({ projectName }) => ({
    projectName: bindMessageToValidator(validate.projectName, 'projectNameLengthHint')(projectName),
  }),
  asyncValidate: ({ projectName }) => validateAsync.projectNameUnique(projectName),
  asyncChangeFields: ['projectName'],
  asyncBlurFields: ['projectName'], // validate on blur in case of copy-paste value
})
export class AddProjectModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object,
    dirty: PropTypes.bool,
    handleSubmit: PropTypes.func,
    change: PropTypes.func,
  };

  static defaultProps = {
    data: {},
    dirty: false,
    handleSubmit: () => {},
    change: () => {},
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  render() {
    const {
      intl,
      data: { onSubmit, eventsInfo },
      handleSubmit,
    } = this.props;
    return (
      <ModalLayout
        title={intl.formatMessage(messages.addProject)}
        okButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.ADD),
          danger: false,
          onClick: () => {
            handleSubmit((values) => {
              onSubmit(values);
            })();
          },
          eventInfo: eventsInfo.addBtn,
        }}
        cancelButton={{
          text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <form>
          <ModalField>
            <SectionHeader text={intl.formatMessage(messages.addProjectTitle)} />
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.projectNameLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="projectName" type="text">
              <FieldErrorHint>
                <Input maxLength="256" />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
