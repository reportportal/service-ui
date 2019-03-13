import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { reduxForm } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { projectIdSelector } from 'controllers/pages';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { SauceLabsFormFields } from '../../integrationProviders/sauceLabsIntegration/sauceLabsFormFields';

const messages = defineMessages({
  createManualTitle: {
    id: 'AddProjectIntegrationModal.createManualTitle',
    defaultMessage: 'Create manual integration',
  },
  addIntegrationSuccess: {
    id: 'AddProjectIntegrationModal.addIntegrationSuccess',
    defaultMessage: 'Integration successfully added',
  },
});

@withModal('addProjectIntegrationModal')
@reduxForm({
  form: 'sauceLabsSettingsForm',
})
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    showDefaultErrorNotification,
    fetchProjectIntegrationsAction,
  },
)
@injectIntl
export class AddProjectIntegrationModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.object,
    projectId: PropTypes.string.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  static defaultProps = {
    data: {},
  };

  onCreate = () => (closeModal) => {
    this.closeModal = closeModal;
    this.props.handleSubmit(this.handleCreateNewIntegration)();
  };

  handleCreateNewIntegration = (formData) => {
    const {
      intl: { formatMessage },
      projectId,
      data: { type },
    } = this.props;
    this.props.showScreenLockAction();

    const data = {
      enabled: true,
      integrationName: type,
      integrationParameters: formData,
    };

    fetch(URLS.newProjectIntegration(projectId), { method: 'post', data })
      .then(() => {
        this.props.fetchProjectIntegrationsAction(projectId);
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.addIntegrationSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.closeModal();
      })
      .catch((error) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(error);
      });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.createManualTitle)}
        okButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.SAVE),
          onClick: this.onCreate(),
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
      >
        <SauceLabsFormFields lineAlign />
      </ModalLayout>
    );
  }
}
