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

import { useState, useEffect, useMemo, useCallback, type ComponentType } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { redirect } from 'redux-first-router';
import { useIntl } from 'react-intl';

import {
  updatePagePropertiesAction,
  ORGANIZATION_SETTINGS_TAB_PAGE,
  urlOrganizationSlugSelector,
} from 'controllers/pages';
import { uiExtensionIntegrationSettingsSelector } from 'controllers/plugins/uiExtensions/selectors';
import { showModalAction } from 'controllers/modal';
import {
  namedGlobalIntegrationsSelector,
  namedOrganizationIntegrationsSelector,
  type Plugin,
  type PluginDetails,
} from 'controllers/plugins';
import { isLimitedIntegrationPlugin } from 'controllers/plugins/utils';
import { ExtensionLoader } from 'components/extensionLoader';
import { INTEGRATIONS_SETTINGS_COMPONENTS_MAP } from 'components/integrations/settingsComponentsMap';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import { createClassnames, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { IntegrationHeader } from 'pages/inside/common/integrations/integrationHeader/integrationHeader';
import { AvailableIntegrations } from 'pages/inside/common/integrations/availableIntegrations';
import { messages } from 'pages/inside/common/integrations/messages';
import type { IntegrationItem } from 'pages/inside/common/integrations/types';
import DeleteIntegraionModal from 'components/integrations/modals/deleteIntegrationModal/deleteIntegraionModal';
import AddIntegrationModal from 'components/integrations/modals/addIntegrationModal/addIntegrationModal';
import { activeOrganizationIdSelector } from 'controllers/organization';

import styles from './integrationInfo.scss';

const cx = createClassnames(styles);

type IntegrationInfoItem = IntegrationItem & { blocked?: boolean };

interface Extension {
  pluginName: string;
  [key: string]: unknown;
}

interface IntegrationSettingsViewProps {
  data: IntegrationItem;
  onUpdate: (formData: Record<string, unknown>, onConfirm: () => void, metaData?: unknown) => void;
  goToPreviousPage: () => void;
  extension?: Extension;
  withPreloader?: boolean;
  silentOnError?: boolean;
}

export interface IntegrationInfoProps {
  plugin: Plugin;
  integrationId?: string;
}

type NamedIntegrations = Record<string, IntegrationItem[]>;

export const IntegrationInfo = ({ plugin, integrationId = '' }: IntegrationInfoProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const pluginName = plugin.name;
  const details: Partial<PluginDetails> = plugin.details ?? {};
  const [integrationInfo, setIntegrationInfo] = useState<Partial<IntegrationInfoItem>>({});
  const [updatedParameters, setUpdatedParameters] = useState<Partial<IntegrationInfoItem>>({});
  const settingsExtensions = useSelector(uiExtensionIntegrationSettingsSelector) as Extension[];
  const { canUpdateSettings } = useUserPermissions();
  const globalIntegrations: NamedIntegrations = useSelector(namedGlobalIntegrationsSelector);
  const organizationIntegrations: NamedIntegrations = useSelector(
    namedOrganizationIntegrationsSelector,
  );
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const organizationId = useSelector(activeOrganizationIdSelector);

  const availableGlobalIntegrations = useMemo(
    () => globalIntegrations[pluginName] || [],
    [globalIntegrations, pluginName],
  );
  const availableOrganizationIntegrations = useMemo(
    () => organizationIntegrations[pluginName] || [],
    [organizationIntegrations, pluginName],
  );
  const isAtLeastOneIntegrationAvailable =
    availableGlobalIntegrations.length > 0 || availableOrganizationIntegrations.length > 0;

  const isOrganizationIntegrationAddLimited = useMemo(
    () => isLimitedIntegrationPlugin(pluginName) && availableOrganizationIntegrations.length > 0,
    [pluginName, availableOrganizationIntegrations],
  );

  const organizationIntegrationCreateButtonTooltip = isOrganizationIntegrationAddLimited
    ? formatMessage(messages.organizationIntegrationAddLimited)
    : undefined;

  const testOrganizationIntegrationConnection = useCallback(
    (connectionIntegrationId: number) =>
      fetch(URLS.testOrganizationIntegrationConnection(organizationId, connectionIntegrationId), {
        method: 'POST',
      }),
    [organizationId],
  );

  const testGlobalIntegrationConnection = useCallback(
    (connectionIntegrationId: number) =>
      fetch(URLS.testGlobalIntegrationConnection(connectionIntegrationId)),
    [],
  );

  useEffect(() => {
    let isGlobal = false;
    let integration = availableOrganizationIntegrations.find(
      (value) => value.id === +integrationId,
    );
    if (!integration) {
      integration = availableGlobalIntegrations.find((value) => value.id === +integrationId);
      isGlobal = !!integration;
    }

    if (integration) {
      setUpdatedParameters({});
      setIntegrationInfo({ ...integration, blocked: isGlobal });
    }
  }, [availableGlobalIntegrations, availableOrganizationIntegrations, integrationId]);

  const integrationSettingsExtension = settingsExtensions?.find(
    (ext) => ext.pluginName === pluginName,
  );
  const IntegrationSettingsComponent = (INTEGRATIONS_SETTINGS_COMPONENTS_MAP[
    pluginName as keyof typeof INTEGRATIONS_SETTINGS_COMPONENTS_MAP
  ] ||
    (integrationSettingsExtension && ExtensionLoader)) as
    | ComponentType<IntegrationSettingsViewProps>
    | false;

  const openIntegration = (integration: IntegrationItem) => {
    const { id } = integration;
    dispatch(
      updatePagePropertiesAction({
        id,
      }),
    );
    setIntegrationInfo(integration);
  };

  const addOrganizationIntegration = () => {
    // TODO: to be implemented in the future
  };

  const onAddOrganizationIntegration = () => {
    const pluginDetails = { ...details };
    const data = {
      hasWarningMessage: Boolean(
        availableGlobalIntegrations.length && availableOrganizationIntegrations.length === 0,
      ),
      instanceType: pluginName,
      onConfirm: addOrganizationIntegration,
      customProps: {
        pluginDetails,
      },
    };
    dispatch(showModalAction({ component: <AddIntegrationModal data={data} /> }));
  };

  const onUpdate = () => {
    // TODO: to be implemented in the future
  };

  const updatedData = {
    ...integrationInfo,
    name: updatedParameters.name || integrationInfo.name || '',
    integrationParameters: {
      ...integrationInfo.integrationParameters,
      ...updatedParameters.integrationParameters,
    },
  } as IntegrationSettingsViewProps['data'];

  const allIntegrationListLink = {
    type: ORGANIZATION_SETTINGS_TAB_PAGE,
    payload: { organizationSlug, settingsTab: INTEGRATIONS },
  };
  const pluginIntegrationListLink = {
    ...allIntegrationListLink,
    query: {
      subPage: pluginName,
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
      id: String(updatedData.id ?? ''),
      title: updatedData.name,
    },
  ];

  const goToPluginIntegrationList = () => {
    dispatch(redirect(pluginIntegrationListLink));
  };

  const resetOrganizationIntegrations = () => {
    // TODO: to be implemented in the future
  };

  const onResetOrganizationIntegration = () => {
    const data = {
      onConfirm: resetOrganizationIntegrations,
      modalTitle: formatMessage(messages.resetIntegrations),
      description: formatMessage(messages.organizationIntegrationResetDescription),
      isReset: true,
    };
    dispatch(showModalAction({ component: <DeleteIntegraionModal data={data} /> }));
  };

  const getButtons = () =>
    canUpdateSettings
      ? [
          {
            name: formatMessage(messages.noIntegrationsOrganizationButtonAdd),
            dataAutomationId: 'addOrganizationIntegrationButton',
            handleButton: onAddOrganizationIntegration,
          },
        ]
      : [];

  const renderIntegrationList = () => (
    <>
      {isAtLeastOneIntegrationAvailable ? (
        <div className={cx('integration-list')}>
          <AvailableIntegrations
            header={formatMessage(messages.organizationIntegrationTitle)}
            text={formatMessage(messages.organizationIntegrationText)}
            integrations={availableOrganizationIntegrations}
            openIntegration={openIntegration}
            testConnection={testOrganizationIntegrationConnection}
            withEmptyState
            hasUpdatePermission={canUpdateSettings}
            onCreateClick={onAddOrganizationIntegration}
            onResetClick={onResetOrganizationIntegration}
            createButtonDisabled={isOrganizationIntegrationAddLimited}
            createButtonTooltip={organizationIntegrationCreateButtonTooltip}
          />
          {availableGlobalIntegrations.length > 0 && (
            <AvailableIntegrations
              header={formatMessage(messages.globalIntegrationTitle)}
              text={formatMessage(messages.globalIntegrationText)}
              integrations={availableGlobalIntegrations}
              openIntegration={openIntegration}
              inactive={Boolean(availableOrganizationIntegrations.length)}
              inactiveTooltip={formatMessage(messages.inactiveGlobalIntegrations)}
              testConnection={testGlobalIntegrationConnection}
            />
          )}
        </div>
      ) : (
        <EmptyStatePage
          title={formatMessage(messages.noIntegrationsConfiguredYet)}
          description={formatMessage(messages.noIntegrationsConfiguredDescription)}
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
            documentationLinkEvent={null}
          />
          {renderIntegrationList()}
        </>
      ) : (
        <>
          <IntegrationHeader
            data={plugin}
            breadcrumbs={integrationBreadcrumbs}
            documentationLinkEvent={null}
          />
          <div className={cx('integration-settings-block')}>
            {IntegrationSettingsComponent ? (
              <IntegrationSettingsComponent
                data={updatedData}
                onUpdate={onUpdate}
                goToPreviousPage={goToPluginIntegrationList}
                extension={integrationSettingsExtension}
                withPreloader
                silentOnError={false}
              />
            ) : null}
          </div>
        </>
      )}
    </>
  );
};
