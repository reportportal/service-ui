import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { canUpdateSettings } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { projectIdSelector } from 'controllers/pages';
import { addIntegrationAction, removeProjectIntegrationsByTypeAction } from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { isIntegrationSupportsMultipleInstances } from 'components/integrations/utils';
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
  resetToGlobalSettingsTitle: {
    id: 'InstancesSection.resetToGlobalSettingsTitle',
    defaultMessage: 'Reset to Global Settings',
  },
  unlinkAndSetupManuallyTitle: {
    id: 'InstancesSection.unlinkAndSetupManuallyTitle',
    defaultMessage: 'Unlink & setup manually',
  },
  resetToGlobalSettingsDescription: {
    id: 'InstancesSection.resetToGlobalSettingsDescription',
    defaultMessage: 'Activate the global settings. All custom integrations will be removed.',
  },
  unlinkAndSetupManuallyDescription: {
    id: 'InstancesSection.unlinkAndSetupManuallyDescription',
    defaultMessage:
      'Unlink the current project from the global settings and configure your own integration. You always can reset to the global settings.',
  },
  globalIntegrationsDisabledHint: {
    id: 'InstancesSection.globalIntegrationsDisabledHint',
    defaultMessage: 'Global settings are inactive due to the manual project configuration.',
  },
  addIntegrationButtonTitle: {
    id: 'InstancesSection.addIntegrationButtonTitle',
    defaultMessage: 'Add integration',
  },
  noGlobalIntegrationMessage: {
    id: 'InstancesSection.noGlobalIntegrationMessage',
    defaultMessage: 'No global integration',
  },
  allGlobalProjects: {
    id: 'InstancesSection.allGlobalProjects',
    defaultMessage: 'All global {pluginName} projects',
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
    removeProjectIntegrationsByTypeAction,
    addIntegrationAction,
  },
)
@injectIntl
export class InstancesSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instanceType: PropTypes.string.isRequired,
    projectId: PropTypes.string,
    onItemClick: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    removeProjectIntegrationsByTypeAction: PropTypes.func.isRequired,
    addIntegrationAction: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    projectIntegrations: PropTypes.array,
    globalIntegrations: PropTypes.array,
    isGlobal: PropTypes.bool,
    title: PropTypes.string,
  };

  static defaultProps = {
    projectIntegrations: [],
    globalIntegrations: [],
    projectId: '',
    isGlobal: false,
    title: '',
  };

  multiple = isIntegrationSupportsMultipleInstances(this.props.instanceType);

  removeProjectIntegrations = () =>
    this.props.removeProjectIntegrationsByTypeAction(this.props.instanceType);

  navigateToNewIntegration = (data) => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.onItemClick(data, data.name || formatMessage(messages.projectSettingsDefaultTitle));
  };

  addProjectIntegration = (formData) => {
    const data = {
      enabled: true,
      integrationParameters: formData,
    };
    const { isGlobal, instanceType } = this.props;

    if (formData.integrationName) {
      data.name = formData.integrationName;
    }

    this.props.addIntegrationAction(data, isGlobal, instanceType, this.navigateToNewIntegration);
  };

  returnToGlobalSettingsClickHandler = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.resetToGlobalSettingsDescription),
        onConfirm: this.removeProjectIntegrations,
        title: formatMessage(messages.resetToGlobalSettingsTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.CONFIRM),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
      },
    });
  };

  addProjectIntegrationClickHandler = () => {
    const { instanceType, isGlobal } = this.props;

    this.props.showModalAction({
      id: 'addIntegrationModal',
      data: {
        onConfirm: this.addProjectIntegration,
        instanceType,
        isGlobal,
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      projectIntegrations,
      globalIntegrations,
      accountRole,
      userRole,
      isGlobal,
    } = this.props;
    const isProjectIntegrationsExists = !!projectIntegrations.length;
    const disabled = !canUpdateSettings(accountRole, userRole);
    const globalIntegrationMessage = this.multiple
      ? messages.globalIntegrations
      : messages.globalIntegration;

    return (
      <div className={cx('instances-section')}>
        {isProjectIntegrationsExists &&
          !isGlobal && (
            <Fragment>
              <InstancesList
                blocked={disabled}
                title={formatMessage(
                  this.multiple ? messages.projectIntegrations : messages.projectIntegration,
                )}
                items={projectIntegrations}
                onItemClick={onItemClick}
                defaultItemTitle={formatMessage(messages.projectSettingsDefaultTitle)}
              />
              {this.multiple &&
                !disabled && (
                  <div className={cx('add-integration-button')}>
                    <GhostButton icon={PlusIcon} onClick={this.addProjectIntegrationClickHandler}>
                      {formatMessage(messages.addIntegrationButtonTitle)}
                    </GhostButton>
                  </div>
                )}
            </Fragment>
          )}
        <InstancesList
          blocked={!isGlobal}
          title={formatMessage(isGlobal ? messages.allGlobalProjects : globalIntegrationMessage, {
            pluginName: this.props.title,
          })}
          items={globalIntegrations}
          onItemClick={onItemClick}
          {...(isGlobal
            ? {}
            : {
                disabled: isProjectIntegrationsExists,
                disabledHint: formatMessage(messages.globalIntegrationsDisabledHint),
              })}
          defaultItemTitle={formatMessage(messages.globalSettingsDefaultTitle)}
        />
        {!globalIntegrations.length && (
          <p className={cx('no-items-message')}>
            {formatMessage(messages.noGlobalIntegrationMessage)}
          </p>
        )}
        {(this.multiple || !globalIntegrations.length) &&
          !disabled &&
          isGlobal && (
            <div className={cx('add-integration-button')}>
              <GhostButton icon={PlusIcon} onClick={this.addProjectIntegrationClickHandler}>
                {formatMessage(messages.addIntegrationButtonTitle)}
              </GhostButton>
            </div>
          )}
        {!disabled &&
          !isGlobal && (
            <div className={cx('settings-action-block')}>
              <GhostButton
                onClick={
                  isProjectIntegrationsExists
                    ? this.returnToGlobalSettingsClickHandler
                    : this.addProjectIntegrationClickHandler
                }
              >
                {formatMessage(
                  isProjectIntegrationsExists
                    ? messages.resetToGlobalSettingsTitle
                    : messages.unlinkAndSetupManuallyTitle,
                )}
              </GhostButton>
              <p className={cx('action-description')}>
                {formatMessage(
                  isProjectIntegrationsExists
                    ? messages.resetToGlobalSettingsDescription
                    : messages.unlinkAndSetupManuallyDescription,
                )}
              </p>
            </div>
          )}
      </div>
    );
  }
}
