import { createSelector } from 'reselect';
import {
  EXTENSION_TYPE_SETTINGS_TAB,
  EXTENSION_TYPE_ADMIN_PAGE,
  EXTENSION_TYPE_PAGE,
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
  EXTENSION_TYPE_POST_ISSUE_FORM,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON,
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON,
  EXTENSION_TYPE_LOG_STACKTRACE_ADDON,
  EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON,
} from './constants';
import { domainSelector, enabledPluginNamesSelector } from '../selectors';
import { uiExtensionMap } from './uiExtensionStorage';

export const extensionsLoadedSelector = (state) =>
  domainSelector(state).uiExtensions.uiExtensionsLoaded;

export const createUiExtensionSelectorByType = (type) =>
  createSelector(enabledPluginNamesSelector, extensionsLoadedSelector, (pluginNames) =>
    Array.from(uiExtensionMap.entries())
      .filter(([name]) => pluginNames.includes(name))
      .map(([, extensions]) => extensions)
      .reduce((acc, val) => acc.concat(val), [])
      .filter((extension) => extension.type === type),
  );

export const uiExtensionSettingsTabsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_SETTINGS_TAB,
);
export const uiExtensionAdminPagesSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_ADMIN_PAGE,
);
export const uiExtensionPagesSelector = createUiExtensionSelectorByType(EXTENSION_TYPE_PAGE);
export const uiExtensionSidebarComponentsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_SIDEBAR_COMPONENT,
);
export const uiExtensionLaunchItemComponentsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_LAUNCH_ITEM_COMPONENT,
);
export const uiExtensionIntegrationFormFieldsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_FORM_FIELDS,
);
export const uiExtensionIntegrationSettingsSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_INTEGRATION_SETTINGS,
);
export const uiExtensionPostIssueFormSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_POST_ISSUE_FORM,
);
export const uniqueErrorGridCellComponentSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_CELL_COMPONENT,
);
export const uniqueErrorGridHeaderCellComponentSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_UNIQUE_ERROR_GRID_HEADER_CELL_COMPONENT,
);

export const makeDecisionDefectCommentAddonSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_COMMENT_ADDON,
);
export const makeDecisionDefectTypeAddonSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_MAKE_DECISION_DEFECT_TYPE_ADDON,
);
export const logStackTraceAddonSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_LOG_STACKTRACE_ADDON,
);
export const testItemDetailsAddonSelector = createUiExtensionSelectorByType(
  EXTENSION_TYPE_TEST_ITEM_DETAILS_ADDON,
);
