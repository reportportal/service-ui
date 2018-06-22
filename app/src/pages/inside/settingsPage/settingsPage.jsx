import React from 'react';
import { PageLayout } from 'layouts/pageLayout';
import { GeneralTab } from './settingsTabs/generalTab';

export const SettingsPage = () => (
  <PageLayout title="Setings">
    <GeneralTab />
  </PageLayout>
);
