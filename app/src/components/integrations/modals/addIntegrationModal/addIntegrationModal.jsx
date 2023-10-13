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
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { INTEGRATION_FORM } from 'components/integrations/elements/integrationSettings';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { uiExtensionIntegrationFormFieldsSelector } from 'controllers/plugins/uiExtensions/selectors';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';
import { INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP } from '../../formFieldComponentsMap';

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
@connect((state) => ({
  fieldsExtensions: uiExtensionIntegrationFormFieldsSelector(state),
}))
@injectIntl
@track()
export class AddIntegrationModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    dirty: PropTypes.bool.isRequired,
    fieldsExtensions: PropTypes.arrayOf(extensionType),
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    fieldsExtensions: [],
    data: {},
  };

  state = {
    metaData: {},
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  updateMetaData = (metaData) => {
    this.setState({
      metaData: {
        ...this.state.metaData,
        ...metaData,
      },
    });
  };

  onSubmit = (data) => {
    this.props.data.onConfirm(data, this.state.metaData);
    this.props.tracking.trackEvent(
      PLUGINS_PAGE_EVENTS.clickSaveEditAuthorizationBtn(this.props.data.instanceType),
    );
  };

  render() {
    const {
      intl: { formatMessage },
      data: { instanceType, isGlobal, customProps = {}, eventsInfo = {} },
      handleSubmit,
      initialize,
      change,
      fieldsExtensions,
    } = this.props;

    const createTitle = isGlobal
      ? formatMessage(messages.createGlobalTitle)
      : formatMessage(messages.createManualTitle);
    const integrationFieldsExtension = fieldsExtensions.find(
      (ext) => ext.pluginName === instanceType,
    );
    const FieldsComponent =
      INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP[instanceType] ||
      (integrationFieldsExtension && ExtensionLoader);

    return (
      <ModalLayout
        title={customProps.editAuthMode ? formatMessage(messages.editAuthTitle) : createTitle}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: handleSubmit(this.onSubmit),
          eventInfo: eventsInfo.saveBtn,
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          eventInfo: eventsInfo.cancelBtn,
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
        closeIconEventInfo={eventsInfo.closeIcon}
      >
        <FieldsComponent
          initialize={initialize}
          change={change}
          updateMetaData={this.updateMetaData}
          lineAlign
          {...customProps}
          extension={integrationFieldsExtension}
          withPreloader
        />
      </ModalLayout>
    );
  }
}
