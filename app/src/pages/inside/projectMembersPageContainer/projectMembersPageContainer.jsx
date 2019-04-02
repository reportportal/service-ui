import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { MembersPage } from 'pages/common/membersPage';

export class ProjectMembersPageContainer extends Component {
  getBreadcrumbs = () => [
    {
      title: <FormattedMessage id="MembersPage.title" defaultMessage="Project members" />,
    },
  ];

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <MembersPage />
        </PageSection>
      </PageLayout>
    );
  }
}
