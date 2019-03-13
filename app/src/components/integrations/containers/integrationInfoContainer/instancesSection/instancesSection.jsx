import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { canUpdateSettings } from 'common/utils/permissions';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { projectIdSelector } from 'controllers/pages';
import { fetchProjectIntegrationsAction } from 'controllers/project';
import { showModalAction, hideModalAction } from 'controllers/modal';
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
  projectIntegration: {
    id: 'InstancesSection.projectIntegration',
    defaultMessage: 'Project integration',
  },
  globalIntegration: {
    id: 'InstancesSection.globalIntegration',
    defaultMessage: 'Global integration',
  },
  projectSettingsDefaultTitle: {
    id: 'InstancesSection.projectSettingsDefaultTitle',
    defaultMessage: 'Project settings',
  },
  globalSettingsDefaultTitle: {
    id: 'InstancesSection.globalSettingsDefaultTitle',
    defaultMessage: 'Global settings',
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
      'Unlink the current project from the global settings and configure your own integration. You always can return to the global settings.',
  },
  globalIntegrationsDisabledHint: {
    id: 'InstancesSection.globalIntegrationsDisabledHint',
    defaultMessage: 'Global settings are inactive due to the manual project configuration.',
  },
  returnToGlobalSuccess: {
    id: 'InstancesSection.returnToGlobalSuccess',
    defaultMessage: 'Global integrations successfully applied',
  },
  addIntegrationSuccess: {
    id: 'AddProjectIntegrationModal.addIntegrationSuccess',
    defaultMessage: 'Integration successfully added',
  },
});

@connect(
  (state) => ({
    projectId: projectIdSelector(state),
    accountRole: userAccountRoleSelector(state),
    userRole: activeProjectRoleSelector(state),
  }),
  {
    showModalAction,
    hideModalAction,
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
    instanceType: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    onItemClick: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    fetchProjectIntegrationsAction: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    projectIntegrations: PropTypes.array,
    globalIntegrations: PropTypes.array,
    multiple: PropTypes.bool,
  };

  static defaultProps = {
    projectIntegrations: [],
    globalIntegrations: [],
    multiple: false,
  };

  removeProjectIntegrations = () => {
    const {
      intl: { formatMessage },
      projectId,
      instanceType,
      onConfirm,
    } = this.props;

    this.props.showScreenLockAction();
    fetch(URLS.removeProjectIntegrationByType(projectId, instanceType), { method: 'delete' })
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

  addProjectIntegration = (formData) => {
    const {
      intl: { formatMessage },
      projectId,
      instanceType,
    } = this.props;
    this.props.showScreenLockAction();

    const data = {
      enabled: true,
      integrationName: instanceType,
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
        this.props.hideModalAction();
        // TODO: also put integrationId here when it will be returned from backend
        this.props.onItemClick(
          { ...data, integrationType: { name: instanceType } },
          formatMessage(messages.projectSettingsDefaultTitle),
        );
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

  unlinkAndSetupManuallyClickHandler = () => {
    const { instanceType } = this.props;

    this.props.showModalAction({
      id: 'addProjectIntegrationModal',
      data: {
        onConfirm: this.addProjectIntegration,
        instanceType,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      projectIntegrations,
      globalIntegrations,
      multiple,
      accountRole,
      userRole,
    } = this.props;
    const isProjectIntegrationsExists = !!projectIntegrations.length;
    const disabled = !canUpdateSettings(accountRole, userRole);

    return (
      <div className={cx('instances-section')}>
        {isProjectIntegrationsExists && (
          <InstancesList
            blocked={disabled}
            title={formatMessage(
              multiple ? messages.projectIntegrations : messages.projectIntegration,
            )}
            items={projectIntegrations}
            onItemClick={onItemClick}
            defaultItemTitle={formatMessage(messages.projectSettingsDefaultTitle)}
          />
        )}
        {!!globalIntegrations.length && (
          <InstancesList
            blocked
            title={formatMessage(
              multiple ? messages.globalIntegrations : messages.globalIntegration,
            )}
            items={globalIntegrations}
            onItemClick={onItemClick}
            disabled={isProjectIntegrationsExists}
            disabledHint={formatMessage(messages.globalIntegrationsDisabledHint)}
            defaultItemTitle={formatMessage(messages.globalSettingsDefaultTitle)}
          />
        )}
        {!disabled && (
          <div className={cx('settings-action-block')}>
            <GhostButton
              onClick={
                isProjectIntegrationsExists
                  ? this.returnToGlobalSettingsClickHandler
                  : this.unlinkAndSetupManuallyClickHandler
              }
            >
              {formatMessage(
                isProjectIntegrationsExists
                  ? messages.returnToGlobalSettingsTitle
                  : messages.unlinkAndSetupManuallyTitle,
              )}
            </GhostButton>
            <p className={cx('action-description')}>
              {formatMessage(
                isProjectIntegrationsExists
                  ? messages.returnToGlobalSettingsDescription
                  : messages.unlinkAndSetupManuallyDescription,
              )}
            </p>
          </div>
        )}
      </div>
    );
  }
}
