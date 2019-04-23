import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { projectIdSelector } from 'controllers/pages';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { GhostButton } from 'components/buttons/ghostButton';
import { InstancesList } from './instancesList';
import styles from './instancesSection.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  projectIntegrations: {
    id: 'InstancesSection.projectIntegrations',
    defaultMessage: 'Project integrations',
  },
  globalIntegrations: {
    id: 'InstancesSection.globalIntegrations',
    defaultMessage: 'Global integrations',
  },
  returnToGlobalSettingsTitle: {
    id: 'InstancesSection.returnToGlobalSettingsTitle',
    defaultMessage: 'Return to Global Settings',
  },
  unlinkAndSetupManuallyTitle: {
    id: 'InstancesSection.unlinkAndSetupManuallyTitle',
    defaultMessage: 'Unlink & setup manually',
  },
  returnToGlobalSettingsDescription: {
    id: 'InstancesSection.returnToGlobalSettingsDescription',
    defaultMessage: 'Activate the global settings. All custom integrations will be removed.',
  },
  unlinkAndSetupManuallyDescription: {
    id: 'InstancesSection.unlinkAndSetupManuallyDescription',
    defaultMessage:
      'Unlink the current project from the global settings and configure your own for the plugin. You always can return to the global settings.',
  },
  globalIntegrationsDisabledHint: {
    id: 'InstancesSection.globalIntegrationsDisabledHint',
    defaultMessage: 'Global settings are inactive due to the manual project configuration.',
  },
  returnToGlobalSuccess: {
    id: 'InstancesSection.returnToGlobalSuccess',
    defaultMessage: 'Integration settings successfully updated',
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
export class InstancesSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    projectIntegrations: PropTypes.array.isRequired,
    globalIntegrations: PropTypes.array.isRequired,
    onItemClick: PropTypes.func.isRequired,
    onCreateNew: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
  };

  removeProjectIntegrations = () => {
    const {
      intl: { formatMessage },
      projectId,
      type,
      onConfirm,
    } = this.props;
    this.props.showScreenLockAction();
    fetch(URLS.removeProjectIntegrationByType(projectId, type), { method: 'delete' })
      .then(() => {
        this.props.fetchProjectIntegrationsAction(projectId);
        this.props.hideScreenLockAction();
        this.props.showNotification({
          message: formatMessage(messages.returnToGlobalSuccess),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        onConfirm();
      })
      .catch((error) => {
        this.props.hideScreenLockAction();
        this.props.showDefaultErrorNotification(error);
      });
  };

  returnToGlobalSettingsClickHandler = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.returnToGlobalSettingsDescription),
        onConfirm: this.removeProjectIntegrations,
        title: formatMessage(messages.returnToGlobalSettingsTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.CONFIRM),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      projectIntegrations,
      globalIntegrations,
      onCreateNew,
    } = this.props;
    const isProjectIntegrationsExist = !!projectIntegrations.length;

    return (
      <div className={cx('instances-section')}>
        {isProjectIntegrationsExist && (
          <InstancesList
            title={formatMessage(messages.projectIntegrations)}
            items={projectIntegrations}
            onItemClick={onItemClick}
          />
        )}
        {!!globalIntegrations.length && (
          <InstancesList
            title={formatMessage(messages.globalIntegrations)}
            items={globalIntegrations}
            onItemClick={onItemClick}
            disabled={isProjectIntegrationsExist}
            blocked
            disabledHint={formatMessage(messages.globalIntegrationsDisabledHint)}
          />
        )}
        <div className={cx('settings-action-block')}>
          <GhostButton
            onClick={
              isProjectIntegrationsExist ? this.returnToGlobalSettingsClickHandler : onCreateNew
            }
          >
            {formatMessage(
              isProjectIntegrationsExist
                ? messages.returnToGlobalSettingsTitle
                : messages.unlinkAndSetupManuallyTitle,
            )}
          </GhostButton>
          <p className={cx('action-description')}>
            {formatMessage(
              isProjectIntegrationsExist
                ? messages.returnToGlobalSettingsDescription
                : messages.unlinkAndSetupManuallyDescription,
            )}
          </p>
        </div>
      </div>
    );
  }
}
