import React from 'react';
import { FormattedMessage } from 'react-intl';

export const INSTALLED_PLUGINS_SUBPAGE = 'installedPlugins';
export const INSTALLED_PLUGINS_SETTINGS_SUBPAGE = 'installedPluginsSettings';

export const SUB_PAGES_SEQUENCE = [INSTALLED_PLUGINS_SUBPAGE, INSTALLED_PLUGINS_SETTINGS_SUBPAGE];

export const DEFAULT_BREADCRUMB = {
  type: '',
  data: {},
  title: (
    <FormattedMessage
      id={'InstalledPluginsTab.installedPluginsBreadcrumbTitle'}
      defaultMessage={'Installed plugins'}
    />
  ),
};
