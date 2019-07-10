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
    id: 'AddProjectIntegrationModal.createManualTitle',
    defaultMessage: 'Create manual integration',
  },
  createGlobalTitle: {
    id: 'AddProjectIntegrationModal.createGlobalTitle',
    defaultMessage: 'Create global integration',
  },
  editAuthTitle: {
    id: 'AddProjectIntegrationModal.editAuthTitle',
    defaultMessage: 'Edit authorization',
  },
});

@withModal('addProjectIntegrationModal')
@reduxForm({
  form: INTEGRATION_FORM,
})
@injectIntl
export class AddProjectIntegrationModal extends Component {
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
      data: { onConfirm, instanceType, isGlobal, customProps = {} },
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
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <FieldsComponent initialize={initialize} change={change} lineAlign {...customProps} />
      </ModalLayout>
    );
  }
}
