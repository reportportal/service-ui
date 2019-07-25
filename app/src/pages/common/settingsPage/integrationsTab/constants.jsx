import React from 'react';
import { FormattedMessage } from 'react-intl';

export const INTEGRATION_SUBPAGE = 'integration';
export const INTEGRATION_SETTINGS_SUBPAGE = 'integrationSettings';

export const SUB_PAGES_SEQUENCE = [INTEGRATION_SUBPAGE, INTEGRATION_SETTINGS_SUBPAGE];

export const DEFAULT_BREADCRUMB = {
  type: '',
  data: {},
  title: (
    <FormattedMessage
      id={'IntegrationsTab.integrationsBreadcrumbTitle'}
      defaultMessage={'Integrations'}
    />
  ),
};
