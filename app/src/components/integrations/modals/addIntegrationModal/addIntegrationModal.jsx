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
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { INTEGRATION_FORM } from 'components/integrations/elements/integrationSettings';
import { INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP } from '../../constants';

const messages = defineMessages({
  createManualTitle: {
    id: 'AddIntegrationModal.createManualTitle',
    defaultMessage: 'Create manual integration',
  },
  createGlobalTitle: {
    id: 'AddIntegrationModal.createGlobalTitle',
    defaultMessage: 'Create global integration',
  },
  editAuthTitle: {
    id: 'AddIntegrationModal.editAuthTitle',
    defaultMessage: 'Edit authorization',
  },
});

@withModal('addIntegrationModal')
@reduxForm({
  form: INTEGRATION_FORM,
})
@injectIntl
export class AddIntegrationModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    data: {},
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
      intl: { formatMessage },
      data: { onConfirm, instanceType, isGlobal, customProps = {}, eventsInfo = {} },
      handleSubmit,
      initialize,
      change,
    } = this.props;

    const createTitle = isGlobal
      ? formatMessage(messages.createGlobalTitle)
      : formatMessage(messages.createManualTitle);
    const FieldsComponent = INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP[instanceType];

    return (
      <ModalLayout
        title={customProps.editAuthMode ? formatMessage(messages.editAuthTitle) : createTitle}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: handleSubmit(onConfirm),
          eventInfo: eventsInfo.saveBtn,
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <FieldsComponent initialize={initialize} change={change} lineAlign {...customProps} />
      </ModalLayout>
    );
  }
}
