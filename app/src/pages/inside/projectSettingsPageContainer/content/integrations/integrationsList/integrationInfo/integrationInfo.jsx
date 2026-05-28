/*
 * Copyright 2026 EPAM Systems
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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { redirect } from 'redux-first-router';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import {
  urlOrganizationAndProjectSelector,
  PROJECT_SETTINGS_TAB_PAGE,
  updatePagePropertiesAction,
} from 'controllers/pages';
import { uiExtensionIntegrationSettingsSelector } from 'controllers/plugins/uiExtensions/selectors';
import { showModalAction } from 'controllers/modal';
import {
  namedGlobalIntegrationsSelector,
  namedOrganizationIntegrationsSelector,
  namedProjectIntegrationsSelector,
  addIntegrationAction,
  updateIntegrationAction,
  removeProjectIntegrationsByTypeAction,
} from 'controllers/plugins';
import { activeOrganizationIdSelector } from 'controllers/organization';
import {
  getTestIntegrationConnection,
  isLimitedIntegrationPlugin,
} from 'controllers/plugins/utils';
import { ExtensionLoader } from 'components/extensionLoader';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP } from 'components/integrations/settingsComponentsMap';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { PROJECT_SETTINGS_INTEGRATION } from 'analyticsEvents/projectSettingsPageEvents';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { EMAIL } from 'common/constants/pluginNames';
import { combineNameAndEmailToFrom, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { projectKeySelector } from 'controllers/project';
import { activeProjectKeySelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { IntegrationHeader } from 'pages/inside/common/integrations/integrationHeader';
import { AvailableIntegrations } from 'pages/inside/common/integrations/availableIntegrations';
import { messages } from 'pages/inside/common/integrations/messages';
import styles from './integrationInfo.scss';

const cx = classNames.bind(styles);

export const IntegrationInfo = (props) => {
  const [integrationInfo, setIntegrationInfo] = useState({});
  const [updatedParameters, setUpdatedParameters] = useState({});
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const settingsExtensions = useSelector(uiExtensionIntegrationSettingsSelector);
  const { canUpdateSettings } = useUserPermissions();
  const globalIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const organizationIntegrations = useSelector(namedOrganizationIntegrationsSelector);
  const projectIntegrations = useSelector(namedProjectIntegrationsSelector);
  const projectKey = useSelector(projectKeySelector);
  const activeProjectKey = useSelector(activeProjectKeySelector);
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const dispatch = useDispatch();
  const {
    plugin: { name: pluginName, details = {} },
    plugin,
    integrationId,
  } = props;

  const availableGlobalIntegrations = useMemo(
    () => globalIntegrations[pluginName] || [],
    [globalIntegrations, pluginName],
  );
  const availableProjectIntegrations = useMemo(
    () => projectIntegrations[pluginName] || [],
    [projectIntegrations, pluginName],
  );
  const availableOrganizationIntegrations = useMemo(
    () => organizationIntegrations[pluginName] || [],
    [organizationIntegrations, pluginName],
  );
  const isAtLeastOneIntegrationAvailable =
    availableGlobalIntegrations.length > 0 ||
    availableOrganizationIntegrations.length > 0 ||
    availableProjectIntegrations.length > 0;

  const showOrganizationalIntegrations = Boolean(availableOrganizationIntegrations.length);
  const showGlobalIntegrations =
    Boolean(availableGlobalIntegrations.length) && !showOrganizationalIntegrations;

  const resetButtonText = showOrganizationalIntegrations
    ? formatMessage(messages.resetIntegrationsToOrganizational)
    : formatMessage(messages.resetIntegrations);

  const isProjectIntegrationAddLimited = useMemo(
    () => isLimitedIntegrationPlugin(pluginName) && availableProjectIntegrations.length > 0,
    [pluginName, availableProjectIntegrations],
  );

  const projectIntegrationCreateButtonTooltip = isProjectIntegrationAddLimited
    ? formatMessage(messages.projectIntegrationAddLimited)
    : undefined;

  const testIntegrationConnection = useCallback(
    (integrationId) =>
      fetch(URLS.testIntegrationConnection(projectKey || activeProjectKey, integrationId)),
    [projectKey, activeProjectKey],
  );

  const testOrganizationIntegrationConnection = useMemo(
    () => getTestIntegrationConnection({ isOrganizational: true, context: { organizationId } }),
    [organizationId],
  );

  useEffect(() => {
    let isGlobal = false;
    let isOrganizational = false;
    let integration = availableProjectIntegrations.find((value) => value.id === +integrationId);
    if (!integration) {
      integration = availableOrganizationIntegrations.find((value) => value.id === +integrationId);
      isOrganizational = !!integration;
    }
    if (!integration) {
      integration = availableGlobalIntegrations.find((value) => value.id === +integrationId);
      isGlobal = !!integration;
    }

    if (integration) {
      setUpdatedParameters({});
      setIntegrationInfo({
        ...integration,
        blocked: isGlobal || isOrganizational,
        isGlobal,
        isOrganizational,
      });
    }
  }, [
    availableGlobalIntegrations,
    availableOrganizationIntegrations,
    availableProjectIntegrations,
    integrationId,
  ]);

  const integrationSettingsExtension = settingsExtensions.find(
    (ext) => ext.pluginName === pluginName,
  );
  const IntegrationSettingsComponent =
    INTEGRATIONS_SETTINGS_COMPONENTS_MAP[pluginName] ||
    (integrationSettingsExtension && ExtensionLoader);

  const openIntegration = (integration) => {
    const { id } = integration;
    dispatch(
      updatePagePropertiesAction({
        id,
      }),
    );
    setIntegrationInfo(integration);
  };

  const addProjectIntegration = (formData, metaData) => {
    const updatedFormData = pluginName === EMAIL ? combineNameAndEmailToFrom(formData) : formData;
    const newData = {
      enabled: true,
      integrationParameters: updatedFormData,
      name: updatedFormData.integrationName || details.name,
    };
    trackEvent(PROJECT_SETTINGS_INTEGRATION.CLICK_CREATE_INTEGRATION_MODAL(pluginName));
    dispatch(addIntegrationAction(newData, false, pluginName, openIntegration, metaData));
  };

  const onAddProjectIntegration = () => {
    const pluginDetails = { ...details };
    const warningNoticeCaption = showOrganizationalIntegrations
      ? formatMessage(messages.projectIntegrationOrganizationalNoticeCaption)
      : formatMessage(messages.globalIntegrationsSystemMessageModalCaption);
    const warningNoticeBody = showOrganizationalIntegrations
      ? formatMessage(messages.projectIntegrationOrganizationalNoticeBody)
      : formatMessage(messages.globalIntegrationsSystemMessageModalText);

    dispatch(
      showModalAction({
        id: 'addIntegrationModal',
        data: {
          hasWarningMessage: Boolean(
            (availableGlobalIntegrations.length || availableOrganizationIntegrations.length) &&
            availableProjectIntegrations.length === 0,
          ),
          instanceType: pluginName,
          onConfirm: addProjectIntegration,
          customProps: {
            pluginDetails,
            globalIntegrationsNoticeCaption: warningNoticeCaption,
            globalIntegrationsNoticeBody: warningNoticeBody,
          },
        },
      }),
    );
    trackEvent(PROJECT_SETTINGS_INTEGRATION.CLICK_ADD_PROJECT_INTEGRATION(pluginName));
  };
  const onUpdate = (formData, onConfirm, metaData) => {
    const updatedFormData = pluginName === EMAIL ? combineNameAndEmailToFrom(formData) : formData;
    const newData = {
      enabled: true,
      integrationParameters: updatedFormData,
    };

    if (updatedFormData.integrationName) {
      newData.name = updatedFormData.integrationName;
    }

    dispatch(
      updateIntegrationAction(
        newData,
        false,
        integrationInfo.id,
        integrationInfo.name,
        (normalizedData) => {
          setUpdatedParameters(normalizedData);
          onConfirm();
        },
        metaData,
      ),
    );
  };

  const updatedData = {
    ...integrationInfo,
    name: updatedParameters.name || integrationInfo.name,
    integrationParameters: {
      ...integrationInfo.integrationParameters,
      ...updatedParameters.integrationParameters,
    },
  };
  const allIntegrationListLink = {
    type: PROJECT_SETTINGS_TAB_PAGE,
    payload: { organizationSlug, projectSlug, settingsTab: INTEGRATIONS },
  };
  const pluginIntegrationListLink = {
    ...allIntegrationListLink,
    meta: {
      query: {
        subPage: pluginName,
      },
    },
  };

  const integrationListBreadcrumbs = [
    {
      id: 'integrationList',
      title: formatMessage(messages.integrationList),
      link: allIntegrationListLink,
    },
    {
      id: pluginName,
      title: details.name || pluginName,
    },
  ];
  const integrationBreadcrumbs = [
    {
      id: 'integrationList',
      title: formatMessage(messages.integrationList),
      link: allIntegrationListLink,
    },
    {
      id: pluginName,
      title: details.name || pluginName,
      link: pluginIntegrationListLink,
    },
    {
      id: updatedData.id,
      title: updatedData.name,
    },
  ];

  const goToPluginIntegrationList = () => {
    dispatch(redirect(pluginIntegrationListLink));
  };

  const resetProjectIntegrations = () =>
    dispatch(removeProjectIntegrationsByTypeAction(pluginName));

  const onResetProjectIntegration = () => {
    dispatch(
      showModalAction({
        id: 'deleteIntegrationModal',
        data: {
          onConfirm: resetProjectIntegrations,
          onConfirmTrackEvent: () =>
            trackEvent(PROJECT_SETTINGS_INTEGRATION.CLICK_RESET_CONFIRM(pluginName)),
          modalTitle: showOrganizationalIntegrations
            ? formatMessage(messages.resetIntegrationsToOrganizational)
            : formatMessage(messages.resetIntegrations),
          description: showOrganizationalIntegrations
            ? formatMessage(messages.projectIntegrationResetToOrganizationalDescription)
            : formatMessage(messages.projectIntegrationResetDescription),
          isReset: true,
        },
      }),
    );
    trackEvent(PROJECT_SETTINGS_INTEGRATION.CLICK_RESET_TO_GLOBAL_INTEGRATION(pluginName));
  };

  const handleDocumentationClick = () => {
    trackEvent(PROJECT_SETTINGS_INTEGRATION.clickDocumentationLink('integrations'));
  };

  const integrationListDocumentationLinkEvent = useMemo(
    () =>
      PROJECT_SETTINGS_INTEGRATION.clickDocumentationLink(
        isAtLeastOneIntegrationAvailable && canUpdateSettings ? 'integrations' : 'no_integrations',
        plugin.name,
      ),
    [isAtLeastOneIntegrationAvailable, canUpdateSettings, plugin.name],
  );

  const integrationDetailDocumentationLinkEvent = useMemo(
    () => PROJECT_SETTINGS_INTEGRATION.clickDocumentationLink('no_integrations', plugin.name),
    [plugin.name],
  );

  const getButtons = () =>
    canUpdateSettings
      ? [
          {
            name: formatMessage(messages.noGlobalIntegrationsButtonAdd),
            dataAutomationId: 'addProjectIntegrationButton',
            handleButton: onAddProjectIntegration,
          },
        ]
      : [];

  const renderIntegrationList = () => (
    <>
      {isAtLeastOneIntegrationAvailable ? (
        <div className={cx('integration-list')}>
          <AvailableIntegrations
            header={formatMessage(messages.projectIntegrationTitle)}
            text={formatMessage(messages.projectIntegrationText)}
            integrations={availableProjectIntegrations}
            openIntegration={openIntegration}
            testConnection={testIntegrationConnection}
            withEmptyState
            hasUpdatePermission={canUpdateSettings}
            onCreateClick={onAddProjectIntegration}
            onResetClick={onResetProjectIntegration}
            createButtonDisabled={isProjectIntegrationAddLimited}
            createButtonTooltip={projectIntegrationCreateButtonTooltip}
            resetButtonText={resetButtonText}
          />
          {showOrganizationalIntegrations && (
            <AvailableIntegrations
              header={formatMessage(messages.organizationalIntegrationTitle)}
              text={formatMessage(messages.organizationalIntegrationText)}
              integrations={availableOrganizationIntegrations}
              openIntegration={openIntegration}
              inactive={Boolean(availableProjectIntegrations.length)}
              inactiveTooltip={formatMessage(messages.inactiveOrganizationIntegrations)}
              testConnection={testOrganizationIntegrationConnection}
            />
          )}
          {showGlobalIntegrations && (
            <AvailableIntegrations
              header={formatMessage(messages.globalIntegrationTitle)}
              text={formatMessage(messages.globalIntegrationText)}
              integrations={availableGlobalIntegrations}
              openIntegration={openIntegration}
              inactive={Boolean(availableProjectIntegrations.length)}
              inactiveTooltip={formatMessage(messages.inactiveGlobalIntegrations)}
              testConnection={testIntegrationConnection}
            />
          )}
        </div>
      ) : (
        <EmptyStatePage
          title={formatMessage(
            canUpdateSettings
              ? messages.noGlobalIntegrationsMessage
              : messages.noGlobalIntegrationsYet,
          )}
          description={formatMessage(
            canUpdateSettings
              ? messages.noGlobalIntegrationsDescription
              : messages.noGlobalIntegrationsYetDescription,
          )}
          handleDocumentationClick={handleDocumentationClick}
          buttons={getButtons()}
        />
      )}
    </>
  );

  return (
    <>
      {!integrationId ? (
        <>
          <IntegrationHeader
            data={plugin}
            breadcrumbs={integrationListBreadcrumbs}
            documentationLinkEvent={integrationListDocumentationLinkEvent}
          />
          {renderIntegrationList()}
        </>
      ) : (
        <>
          <IntegrationHeader
            data={plugin}
            breadcrumbs={integrationBreadcrumbs}
            documentationLinkEvent={integrationDetailDocumentationLinkEvent}
          />
          <div className={cx('integration-settings-block')}>
            <IntegrationSettingsComponent
              data={updatedData}
              onUpdate={onUpdate}
              goToPreviousPage={goToPluginIntegrationList}
              extension={integrationSettingsExtension}
              withPreloader
              silentOnError={false}
              isGlobal={integrationInfo.isGlobal}
              isOrganizational={integrationInfo.isOrganizational}
              submitTrackEvent={PROJECT_SETTINGS_INTEGRATION.CLICK_SUBMIT_CONFIGURATION(pluginName)}
              deleteConfirmTrackEvent={() =>
                trackEvent(PROJECT_SETTINGS_INTEGRATION.CLICK_DELETE_CONFIRM(pluginName))
              }
            />
          </div>
        </>
      )}
    </>
  );
};

IntegrationInfo.propTypes = {
  plugin: PropTypes.shape({
    creationDate: PropTypes.number,
    enabled: PropTypes.bool,
    groupType: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.number,
    details: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      version: PropTypes.string,
      resources: PropTypes.string,
    }),
  }).isRequired,
  integrationId: PropTypes.string,
};

IntegrationInfo.defaultProps = {
  integrationId: '',
};
