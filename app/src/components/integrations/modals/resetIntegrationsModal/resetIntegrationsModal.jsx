import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import { projectIdSelector } from 'controllers/pages';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout, withModal } from 'components/main/modal';

const messages = defineMessages({
  resetIntegrationsTitle: {
    id: 'ResetIntegrationsModal.resetIntegrationsTitle',
    defaultMessage: 'Return to global settings',
  },
  returnButtonTitle: {
    id: 'ResetIntegrationsModal.returnButtonTitle',
    defaultMessage: 'Return',
  },
  resetIntegrationConfirmation: {
    id: 'ResetIntegrationsModal.resetIntegrationConfirmation',
    defaultMessage: 'Are you sure you want to return integration settings to instance?',
  },
  resetIntegrationsSuccess: {
    id: 'ResetIntegrationsModal.resetIntegrationsSuccess',
    defaultMessage: 'Global settings have been successfully applied',
  },
});

@withModal('resetIntegrationsModal')
@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showNotification,
    fetchProjectIntegrationsAction,
  },
)
@injectIntl
export class ResetIntegrationsModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    showNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
    data: PropTypes.object,
  };

  static defaultProps = {
    data: {
      integrationName: '',
    },
  };

  resetIntegrationClickHandler = (closeModal) => {
    const {
      data: { integrationName },
      intl: { formatMessage },
      projectId,
    } = this.props;
    fetch(URLS.resetIntegrationsByType(projectId, integrationName), { method: 'DELETE' })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.resetIntegrationsSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchProjectIntegrationsAction(projectId);
        closeModal();
      })
      .catch((error) => {
        this.props.showNotification({
          message: error.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <ModalLayout
        title={formatMessage(messages.resetIntegrationsTitle)}
        okButton={{
          text: formatMessage(messages.returnButtonTitle),
          onClick: this.resetIntegrationClickHandler,
          danger: true,
        }}
        cancelButton={{
          text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        }}
      >
        <div>{formatMessage(messages.resetIntegrationConfirmation)}</div>
      </ModalLayout>
    );
  }
}
