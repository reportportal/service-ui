import React from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { Page } from 'components/main/page';
import { FilterTable } from './filterTable';

const messages = defineMessages({
  filtersPageTitle: {
    id: 'FiltersPage.title',
    defaultMessage: 'Filters',
  },
});

export const FiltersPage = injectIntl(({ intl }) => (
  <Page title={intl.formatMessage(messages.filtersPageTitle)}>
    <FilterTable />
  </Page>
));
