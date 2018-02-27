import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { PageLayout } from 'layouts/pageLayout';
import { FilterTable } from './filterTable';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
});

export const FiltersPage = injectIntl(({ intl }) => (
  <PageLayout title={intl.formatMessage(messages.filtersPageTitle)}>
    <FilterTable />
  </PageLayout>
));
