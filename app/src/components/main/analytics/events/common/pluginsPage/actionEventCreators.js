/*
 * Copyright 2021 EPAM Systems
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

export const getPluginInstanceItemClickEvent = (category) => (pluginName) => ({
  category,
  action: `Click on instances list item in ${pluginName}`,
  label: 'Open page with configuration',
});
export const getPluginEditAuthorizationClickEvent = (category) => (pluginName) => ({
  category,
  action: `Click on icon pencil Edit authorization in ${pluginName}`,
  label: 'Open modal Edit authorization',
});
export const getPluginRemoveIntegrationClickEvent = (category) => (pluginName) => ({
  category,
  action: `Click on icon remove integration in ${pluginName}`,
  label: 'Open modal Remove integration',
});
export const getPluginConfigureClickEvent = (category) => (pluginName) => ({
  category,
  action: `Click on button configure in ${pluginName}`,
  label: 'Open configuration table',
});
export const getPluginChoosePropertiesCheckboxClickEvent = (category) => (
  pluginName,
  property,
) => ({
  category,
  action: `Click on checkboxes to choose properties for issue form in ${pluginName}`,
  label: property,
});
export const getPluginConfigureClickSubmitEvent = (category) => (pluginName) => ({
  category,
  action: `Click on button Submit in ${pluginName}`,
  label: `Click on button Submit in ${pluginName}`,
});

export const getClickSaveBtnEditAuthorizationEvent = (category) => (pluginName) => ({
  category,
  action: `Click on button Save on ${pluginName} modal Edit authorization`,
  label: `Save changes on ${pluginName} modal Edit authorization`,
});
export const getClickDeleteBtnRemoveIntegrationEvent = (category) => (pluginName) => ({
  category,
  action: `Click on button Delete on ${pluginName} modal Remove integration`,
  label: `Close modal Remove integration and delete ${pluginName} integration`,
});
export const getIntegrationAddClickEvent = (category) => (integrationName) => ({
  category,
  action: `Click on Add integration ${integrationName} plugin`,
  label: `Arise Modal Create Manual Integration for ${integrationName} integration`,
});
export const getSaveIntegrationModalEvents = (category) => (integrationName, isGlobal) => {
  const integrationType = isGlobal ? 'Global' : 'Project';
  return {
    saveBtn: {
      category,
      action: `Click on Save in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Save ${integrationType.toLowerCase()} integration for ${integrationName} plugin`,
    },
    cancelBtn: {
      category,
      action: `Click on Cancel in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Close Modal Save ${integrationType} Integration for ${integrationName} plugin`,
    },
    closeIcon: {
      category,
      action: `Click on Close icon in Modal Save ${integrationType} Integration for ${integrationName} plugin`,
      label: `Close Modal Save ${integrationType} Integration for ${integrationName} plugin`,
    },
  };
};
