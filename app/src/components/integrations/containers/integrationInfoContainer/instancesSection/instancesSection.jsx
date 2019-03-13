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
import {
  addProjectIntegrationAction,
  removeProjectIntegrationsByTypeAction,
} from 'controllers/project';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES } from '../../../constants';
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
  addIntegrationButtonTitle: {
    id: 'InstancesSection.addIntegrationButtonTitle',
    defaultMessage: 'Add integration',
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
    addProjectIntegrationAction,
  },
)
@injectIntl
export class InstancesSection extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    instanceType: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    onItemClick: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    removeProjectIntegrationsByTypeAction: PropTypes.func.isRequired,
    addProjectIntegrationAction: PropTypes.func.isRequired,
    accountRole: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    projectIntegrations: PropTypes.array,
    globalIntegrations: PropTypes.array,
  };

  static defaultProps = {
    projectIntegrations: [],
    globalIntegrations: [],
  };

  multiple = INTEGRATIONS_SUPPORTS_MULTIPLE_INSTANCES[this.props.instanceType];

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
      integrationName: this.props.instanceType,
      integrationType: { name: this.props.instanceType },
      integrationParameters: formData,
    };

    this.props.addProjectIntegrationAction(data, this.navigateToNewIntegration);
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

  addProjectIntegrationClickHandler = () => {
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
      accountRole,
      userRole,
    } = this.props;
    const isProjectIntegrationsExists = !!projectIntegrations.length;
    const disabled = !canUpdateSettings(accountRole, userRole);

    return (
      <div className={cx('instances-section')}>
        {isProjectIntegrationsExists && (
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
            {this.multiple && (
              <div className={cx('add-integration-button')}>
                <GhostButton icon={PlusIcon} onClick={this.addProjectIntegrationClickHandler}>
                  {formatMessage(messages.addIntegrationButtonTitle)}
                </GhostButton>
              </div>
            )}
          </Fragment>
        )}
        {!!globalIntegrations.length && (
          <InstancesList
            blocked
            title={formatMessage(
              this.multiple ? messages.globalIntegrations : messages.globalIntegration,
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
                  : this.addProjectIntegrationClickHandler
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
