import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { ServerSettingsTabs } from './serverSettingsTabs';

export const ServerSettingsPage = () => (
  <PageLayout
    title={<FormattedMessage id={'ServerSettingsPage.title'} defaultMessage={'Server settings'} />}
  >
    <ServerSettingsTabs />
  </PageLayout>
);
