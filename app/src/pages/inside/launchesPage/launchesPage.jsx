import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'LaunchesPage.title',
    defaultMessage: 'Launches',
  },
});

export const LaunchesPage = injectIntl(({ intl }) => (
  <PageLayout title={intl.formatMessage(messages.filtersPageTitle)} />
));
