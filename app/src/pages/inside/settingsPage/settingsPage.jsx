import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { SettingTabs } from './settingTabs';

export const SettingsPage = () => (
  <PageLayout title={<FormattedMessage id={'SettingsPage.title'} defaultMessage={'Settings'} />}>
    <SettingTabs />
  </PageLayout>
);
