import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
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
import { SauceLabsSettingsForm } from './sauceLabsSettingsForm';
import styles from './sauceLabsSettings.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  connectionTitle: {
    id: 'SauceLabsSettings.connectionTitle',
    defaultMessage: 'Connection',
  },
  settingsTitle: {
    id: 'SauceLabsSettings.settingsTitle',
    defaultMessage: 'Integration settings',
  },
  connectedMessage: {
    id: 'SauceLabsSettings.connectedMessage',
    defaultMessage: 'Connected',
  },
  removeIntegrationTitle: {
    id: 'SauceLabsSettings.removeIntegrationTitle',
    defaultMessage: 'Remove Integration',
  },
  removeIntegrationMessage: {
    id: 'SauceLabsSettings.removeIntegrationMessage',
    defaultMessage: 'Do you really want to remove the integration?',
  },
  removeIntegrationSuccess: {
    id: 'SauceLabsSettings.removeIntegrationSuccess',
    defaultMessage: 'Integration successfully deleted',
  },
  updateIntegrationSuccess: {
    id: 'SauceLabsSettings.updateIntegrationSuccess',
    defaultMessage: 'Integration successfully updated',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
  }),
  {
    showModalAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    showDefaultErrorNotification,
    fetchProjectIntegrationsAction,
  },
)
@injectIntl
export class SauceLabsSettings extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    projectId: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
  };

  removeIntegration = () => {
    const {
      intl: { formatMessage },
      projectId,
      goToPreviousPage,
      data,
    } = this.props;
    this.props.showScreenLockAction();
    fetch(URLS.projectIntegration(projectId, data.id), { method: 'delete' })
      .then(() => {
        this.props.fetchProjectIntegrationsAction(projectId);
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.removeIntegrationSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        goToPreviousPage();
      })
      .catch((error) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(error);
      });
  };

  removeIntegrationHandler = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.removeIntegrationMessage),
        onConfirm: this.removeIntegration,
        title: formatMessage(messages.removeIntegrationTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
      },
    });
  };

  updateIntegration = (formData, onConfirm) => {
    const {
      intl: { formatMessage },
      projectId,
      data: { id, integrationType },
    } = this.props;
    this.props.showScreenLockAction();

    const data = {
      enabled: true,
      integrationName: integrationType.name,
      integrationParameters: formData,
    };

    fetch(URLS.projectIntegration(projectId, id), { method: 'put', data })
      .then(() => {
        this.props.fetchProjectIntegrationsAction(projectId);
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.updateIntegrationSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        onConfirm();
      })
      .catch((error) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(error);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      data,
    } = this.props;

    return (
      <div className={cx('sauce-labs-settings')}>
        <div className={cx('settings-block')}>
          <h3 className={cx('block-header')}>{formatMessage(messages.connectionTitle)}</h3>
          <div className={cx('connection-status-block')}>
            {formatMessage(messages.connectedMessage)}
          </div>
          <button
            className={cx('remove-integration-button', { disabled: data.blocked })}
            onClick={this.removeIntegrationHandler}
          >
            {formatMessage(messages.removeIntegrationTitle)}
          </button>
        </div>
        <div className={cx('settings-block')}>
          <h3 className={cx('block-header')}>{formatMessage(messages.settingsTitle)}</h3>
          <SauceLabsSettingsForm data={data} onSubmit={this.updateIntegration} />
        </div>
      </div>
    );
  }
}
