import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { GeneralTab } from './settingTabs/generalTab';

export const SettingsPage = () => (
  <PageLayout title={<FormattedMessage id={'SettingsPage.title'} defaultMessage={'Settings'} />}>
    <GeneralTab />
  </PageLayout>
);
