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

import {
  EMAIL,
  GROUP_TYPES_BY_PLUGIN_NAMES_MAP,
  MOBITRU,
  SAUCE_LABS,
} from 'common/constants/pluginNames';
import { AUTHORIZATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  COMMAND_TEST_CONNECTION,
  PLUGIN_TYPE_EXTENSION,
  PLUGIN_TYPE_REMOTE,
} from 'controllers/plugins/uiExtensions/constants';
import {
  addGlobalIntegrationSuccessAction,
  addOrganizationIntegrationSuccessAction,
  addProjectIntegrationSuccessAction,
  removeGlobalIntegrationSuccessAction,
  removeOrganizationIntegrationSuccessAction,
  removeProjectIntegrationSuccessAction,
  updateGlobalIntegrationSuccessAction,
  updateOrganizationIntegrationSuccessAction,
  updateProjectIntegrationSuccessAction,
} from './actionCreators';

export const LIMITED_INTEGRATION_PLUGINS = [EMAIL, MOBITRU, SAUCE_LABS];

export const isLimitedIntegrationPlugin = (pluginName) =>
  LIMITED_INTEGRATION_PLUGINS.includes(pluginName);

export const filterIntegrationsByName = (integrations, integrationName) =>
  integrations.filter((integration) => integration.integrationType.name === integrationName);

export const sortItemsByGroupType = (items) =>
  items.sort((a, b) => {
    const groupTypeA = a.groupType || a.integrationType.groupType;
    const groupTypeB = b.groupType || b.integrationType.groupType;
    return groupTypeA.localeCompare(groupTypeB);
  });

export const groupItems = (items) =>
  items.reduce((acc, item) => {
    const groupType = item.groupType || item.integrationType.groupType;
    const groupedItems = { ...acc };
    if (!groupedItems[groupType]) {
      groupedItems[groupType] = [item];
    } else {
      groupedItems[groupType].push(item);
    }
    return groupedItems;
  }, {});

export const isPostIssueActionAvailable = (integrations) =>
  integrations.length &&
  integrations.some((item) => item.integrationParameters.defectFormFields?.length);

export const filterEnabledExternalPlugins = (plugins = []) =>
  plugins.filter(
    (item) => item.enabled && [PLUGIN_TYPE_REMOTE, PLUGIN_TYPE_EXTENSION].includes(item.pluginType),
  );

export const filterAvailablePlugins = (plugins = []) =>
  plugins.filter((item) => {
    const { details } = item;
    const isEmbedded =
      GROUP_TYPES_BY_PLUGIN_NAMES_MAP[item.name] === item.groupType || details?.metadata?.embedded;

    return item.enabled && item.groupType !== AUTHORIZATION_GROUP_TYPE && isEmbedded;
  });

const INTEGRATION_NORMALIZATION_MAPS = {
  root: {
    created_at: 'creationDate',
    integration_type: 'integrationType',
    parameters: 'integrationParameters',
  },
  integrationType: {
    plugin_type: 'pluginType',
    group_type: 'groupType',
    created_at: 'creationDate',
  },
};

const renameFields = (obj, fieldsMap) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const normalized = { ...obj };

  for (const [oldKey, newKey] of Object.entries(fieldsMap)) {
    if (newKey in normalized) {
      continue;
    }

    if (oldKey in normalized) {
      normalized[newKey] = normalized[oldKey];
      delete normalized[oldKey];
    }
  }

  return normalized;
};

export const normalizeIntegrationItem = (item) => {
  const normalizedItem = renameFields(item, INTEGRATION_NORMALIZATION_MAPS.root);

  if (normalizedItem.integrationType) {
    normalizedItem.integrationType = renameFields(
      normalizedItem.integrationType,
      INTEGRATION_NORMALIZATION_MAPS.integrationType,
    );
  }

  return normalizedItem;
};

export const getAddIntegrationUrl = ({ isGlobal, isOrganizational, pluginName, context }) => {
  const { projectKey, organizationId } = context;

  switch (true) {
    case isGlobal:
      return URLS.newGlobalIntegration(pluginName);
    case isOrganizational:
      return URLS.organizationIntegrations(organizationId);
    default:
      return URLS.newProjectIntegration(projectKey, pluginName);
  }
};

export const getAddIntegrationSuccessAction = ({ isGlobal, isOrganizational }) => {
  switch (true) {
    case isGlobal:
      return addGlobalIntegrationSuccessAction;
    case isOrganizational:
      return addOrganizationIntegrationSuccessAction;
    default:
      return addProjectIntegrationSuccessAction;
  }
};

export const getTestIntegrationConnection = ({
  pluginName,
  isGlobal = false,
  isOrganizational = false,
  context = {},
}) => {
  const { projectId, projectKey, organizationId } = context;

  return (integrationId) =>
    fetch(URLS.pluginsCommandsCommon(pluginName, COMMAND_TEST_CONNECTION), {
      method: 'POST',
      data: buildPluginCommandRQ({
        integrationId,
        projectId: isOrganizational ? undefined : projectId,
        projectKey: isOrganizational || isGlobal ? undefined : projectKey,
        organizationId: isGlobal ? undefined : organizationId,
        isGlobal,
      }),
    });
};

export const getIntegrationByIdUrl = ({ isGlobal, isOrganizational, id, context }) => {
  const { projectKey, organizationId } = context;

  switch (true) {
    case isGlobal:
      return URLS.globalIntegration(id);
    case isOrganizational:
      return URLS.organizationIntegrationById(organizationId, id);
    default:
      return URLS.projectIntegration(projectKey, id);
  }
};

export const getUpdateIntegrationSuccessAction = ({ isGlobal, isOrganizational }) => {
  switch (true) {
    case isGlobal:
      return updateGlobalIntegrationSuccessAction;
    case isOrganizational:
      return updateOrganizationIntegrationSuccessAction;
    default:
      return updateProjectIntegrationSuccessAction;
  }
};

export const getRemoveIntegrationSuccessAction = ({ isGlobal, isOrganizational }) => {
  switch (true) {
    case isGlobal:
      return removeGlobalIntegrationSuccessAction;
    case isOrganizational:
      return removeOrganizationIntegrationSuccessAction;
    default:
      return removeProjectIntegrationSuccessAction;
  }
};

export const buildPluginCommandRQ = ({
  integrationId,
  organizationId,
  projectId,
  projectKey,
  isGlobal = false,
  arguments: commandArguments = {},
}) => {
  const context = { integration_id: integrationId };

  if (!isGlobal) {
    if (projectKey && projectId != null) {
      context.project_id = projectId;
      if (organizationId != null) {
        context.org_id = organizationId;
      }
    } else if (organizationId != null) {
      context.org_id = organizationId;
    }
  }

  return {
    context,
    arguments: commandArguments,
  };
};
