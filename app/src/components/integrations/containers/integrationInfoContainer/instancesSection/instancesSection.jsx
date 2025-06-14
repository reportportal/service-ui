/*
 * Copyright 2025 EPAM Systems
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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import track from 'react-tracking';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { canUpdateSettings } from 'common/utils/permissions';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/pages';
import {
  removePluginAction,
  addIntegrationAction,
  removeProjectIntegrationsByTypeAction,
  enabledPluginSelector,
} from 'controllers/plugins';
import { showModalAction } from 'controllers/modal';
import {
  PLUGINS_PAGE_EVENTS,
  getUninstallPluginBtnClickEvent,
  getIntegrationUnlinkGlobalEvent,
} from 'components/main/analytics/events';
import { GhostButton } from 'components/buttons/ghostButton';
import { BigButton } from 'components/buttons/bigButton';
import {
  arePluginIntegrationsAllowed,
  isIntegrationSupportsMultipleInstances,
  isPluginBuiltin,
} from 'components/integrations/utils';
import { EMAIL, LDAP } from 'common/constants/pluginNames';
import { combineNameAndEmailToFrom } from 'common/utils';
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
  resetToGlobalSettingsTitle: {
    id: 'InstancesSection.resetToGlobalSettingsTitle',
    defaultMessage: 'Reset to Global Settings',
  },
  unlinkAndSetupManuallyTitle: {
    id: 'InstancesSection.unlinkAndSetupManuallyTitle',
    defaultMessage: 'Unlink & Setup Manually',
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
  allGlobalIntegrations: {
    id: 'InstancesSection.allGlobalIntegrations',
    defaultMessage: 'All global {pluginName} integrations',
  },
  uninstallPluginConfirmation: {
    id: 'InstancesSection.uninstallPluginConfirmation',
    defaultMessage: 'Are you sure you want to uninstall {pluginName} Plugin?',
  },
  uninstallPluginTitle: {
    id: 'InstancesSection.uninstallPluginTitle',
    defaultMessage: 'Uninstall plugin',
  },
  uninstallPluginNote: {
    id: 'InstancesSection.uninstallPluginNote',
    defaultMessage:
      'Remove this plugin from the ReportPortal and revoke all access and authorizations.',
  },
});

@connect(
  (state, ownProps) => ({
    userRoles: userRolesSelector(state),
    isEnabled: enabledPluginSelector(state, ownProps.instanceType),
  }),
  {
    showModalAction,
    removeProjectIntegrationsByTypeAction,
    addIntegrationAction,
    removePluginAction,
  },
)
@injectIntl
@track()
export class InstancesSection extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    instanceType: PropTypes.string.isRequired,
    pluginType: PropTypes.string.isRequired,
    onItemClick: PropTypes.func.isRequired,
    removePluginSuccessCallback: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    removeProjectIntegrationsByTypeAction: PropTypes.func.isRequired,
    addIntegrationAction: PropTypes.func.isRequired,
    removePluginAction: PropTypes.func.isRequired,
    userRoles: userRolesType,
    userRole: PropTypes.string.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    pluginDetails: PropTypes.object,
    projectIntegrations: PropTypes.array,
    globalIntegrations: PropTypes.array,
    isGlobal: PropTypes.bool,
    title: PropTypes.string,
    pluginId: PropTypes.number,
    events: PropTypes.object,
  };

  static defaultProps = {
    pluginDetails: {},
    projectIntegrations: [],
    globalIntegrations: [],
    isGlobal: false,
    title: '',
    pluginId: null,
    events: {},
    userRoles: {},
  };

  constructor(props) {
    super(props);
    const { instanceType, pluginDetails } = props;
    this.multiple =
      isIntegrationSupportsMultipleInstances(instanceType) || pluginDetails?.metadata?.multiple;
    this.builtin = isPluginBuiltin(instanceType);
  }

  removePlugin = () => {
    const { pluginId, removePluginSuccessCallback, instanceType } = this.props;
    this.props.removePluginAction(pluginId, removePluginSuccessCallback, instanceType);
  };

  removeProjectIntegrations = () =>
    this.props.removeProjectIntegrationsByTypeAction(this.props.instanceType);

  navigateToNewIntegration = (data) =>
    this.props.onItemClick(
      {
        ...data,
        isNew: true,
      },
      data.name,
    );

  createIntegration = (formData, metaData) => {
    const { isGlobal, instanceType, pluginDetails } = this.props;
    const updatedFormData = instanceType === EMAIL ? combineNameAndEmailToFrom(formData) : formData;
    const data = {
      enabled: true,
      integrationParameters: updatedFormData,
      name: updatedFormData.integrationName || pluginDetails.name,
    };

    this.props.addIntegrationAction(
      data,
      isGlobal,
      instanceType,
      this.navigateToNewIntegration,
      metaData,
    );
  };

  removePluginClickHandler = () => {
    const {
      intl: { formatMessage },
      instanceType,
      tracking,
      pluginDetails,
    } = this.props;
    tracking.trackEvent(getUninstallPluginBtnClickEvent(instanceType));

    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: formatMessage(messages.uninstallPluginConfirmation, {
          pluginName: pluginDetails.name || instanceType,
        }),
        onConfirm: this.removePlugin,
        title: formatMessage(messages.uninstallPluginTitle),
        confirmText: formatMessage(COMMON_LOCALE_KEYS.UNINSTALL),
        cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
        eventsInfo: {
          confirmBtn: PLUGINS_PAGE_EVENTS.clickConfirmUninstallPlugin(instanceType),
          closeIcon: PLUGINS_PAGE_EVENTS.CLOSE_ICON_UNINSTALL_PLUGIN_MODAL,
          cancelBtn: PLUGINS_PAGE_EVENTS.CANCEL_BTN_UNINSTALL_PLUGIN_MODAL,
        },
      },
    });
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

  showAddIntegrationModal = () => {
    const { instanceType, pluginDetails, isGlobal } = this.props;

    const isLdap = instanceType === LDAP;

    this.props.showModalAction({
      id: isLdap ? 'addLdapIntegrationModal' : 'addIntegrationModal',
      data: {
        onConfirm: this.createIntegration,
        instanceType,
        isGlobal,
        customProps: {
          pluginDetails,
        },
      },
    });
  };

  addIntegrationClickHandler = () => {
    const { instanceType, tracking, events } = this.props;

    tracking.trackEvent(events.integrationAddClickEvent(instanceType));
    this.showAddIntegrationModal();
  };

  unlinkAndSetupManuallyClickHandler = () => {
    const { instanceType, tracking } = this.props;

    tracking.trackEvent(getIntegrationUnlinkGlobalEvent(instanceType));
    this.showAddIntegrationModal();
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      projectIntegrations,
      globalIntegrations,
      userRoles,
      isGlobal,
      pluginDetails: { metadata },
      pluginType,
      isEnabled,
    } = this.props;
    const isProjectIntegrationsExists = !!projectIntegrations.length;
    const disabled = !canUpdateSettings(userRoles);
    const globalIntegrationMessage = this.multiple
      ? messages.globalIntegrations
      : messages.globalIntegration;
    const isIntegrationsAllowed = arePluginIntegrationsAllowed(pluginType, metadata);

    return (
      <div className={cx('instances-section')}>
        {isIntegrationsAllowed && isEnabled && (
          <Fragment>
            {isProjectIntegrationsExists && !isGlobal && (
              <Fragment>
                <InstancesList
                  blocked={disabled}
                  title={formatMessage(
                    this.multiple ? messages.projectIntegrations : messages.projectIntegration,
                  )}
                  items={projectIntegrations}
                  onItemClick={onItemClick}
                  isGlobal={isGlobal}
                />
                {this.multiple && !disabled && (
                  <div className={cx('add-integration-button')}>
                    <GhostButton icon={PlusIcon} onClick={this.addIntegrationClickHandler}>
                      {formatMessage(messages.addIntegrationButtonTitle)}
                    </GhostButton>
                  </div>
                )}
              </Fragment>
            )}
            <InstancesList
              blocked={!isGlobal}
              title={formatMessage(
                isGlobal && this.multiple
                  ? messages.allGlobalIntegrations
                  : globalIntegrationMessage,
                {
                  pluginName: this.props.title,
                },
              )}
              items={globalIntegrations}
              onItemClick={onItemClick}
              isGlobal={isGlobal}
              {...(isGlobal
                ? {}
                : {
                    disabled: isProjectIntegrationsExists,
                    disabledHint: formatMessage(messages.globalIntegrationsDisabledHint),
                  })}
            />
            {!globalIntegrations.length && (
              <p className={cx('no-items-message')}>
                {formatMessage(messages.noGlobalIntegrationMessage)}
              </p>
            )}
            {(this.multiple || !globalIntegrations.length) && !disabled && isGlobal && (
              <div className={cx('add-integration-button')}>
                <GhostButton icon={PlusIcon} onClick={this.addIntegrationClickHandler}>
                  {formatMessage(messages.addIntegrationButtonTitle)}
                </GhostButton>
              </div>
            )}
          </Fragment>
        )}
        {isGlobal && !this.builtin && (
          <Fragment>
            <h3 className={cx('uninstall-plugin-title')}>
              {formatMessage(messages.uninstallPluginTitle)}
            </h3>
            <p className={cx('uninstall-plugin-note')}>
              {formatMessage(messages.uninstallPluginNote)}
            </p>
            <BigButton
              className={cx('uninstall-plugin-button')}
              color={'tomato'}
              roundedCorners
              onClick={this.removePluginClickHandler}
            >
              {formatMessage(COMMON_LOCALE_KEYS.UNINSTALL)}
            </BigButton>
          </Fragment>
        )}
        {!disabled && !isGlobal && (
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
