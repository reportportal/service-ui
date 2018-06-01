/* eslint no-unused-vars: 0,  spaced-comment: 0 */
//TODO: Turn on eslint rule when Tabs Component is merged
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { GeneralTab } from './settingTabs/generalTab';
import { NotificationsTab } from './settingTabs/notificationsTab';
import { SettingTabs } from './settingTabs';

export const SettingsPage = () => (
  <PageLayout title={<FormattedMessage id={'SettingsPage.title'} defaultMessage={'Settings'} />}>
    {/*<GeneralTab />*/}
    <NotificationsTab />
  </PageLayout>
);
