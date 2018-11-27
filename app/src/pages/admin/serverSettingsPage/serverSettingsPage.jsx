import React, { Component } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { ServerSettingsTabs } from './serverSettingsTabs';

const messages = defineMessages({
  pageTitle: {
    id: 'ServerSettingsPage.title',
    defaultMessage: 'Server settings',
  },
});

@injectIntl
export class ServerSettingsPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
    },
  ];

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <ServerSettingsTabs />
        </PageSection>
      </PageLayout>
    );
  }
}
