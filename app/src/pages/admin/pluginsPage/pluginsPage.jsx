import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { pluginsSelector } from 'controllers/plugins';
import { AUTHORIZATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { PluginsTabs } from './pluginsTabs';

const messages = defineMessages({
  pageTitle: {
    id: 'PluginsPage.title',
    defaultMessage: 'Plugins',
  },
});

@connect((state) => ({
  plugins: pluginsSelector(state),
}))
@injectIntl
export class PluginsPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    plugins: PropTypes.array.isRequired,
  };

  getBreadcrumbs = () => [
    {
      title: this.props.intl.formatMessage(messages.pageTitle),
    },
  ];

  getFilterItems = () => [...new Set(this.getPlugins().map((item) => item.groupType))];

  getPlugins = () =>
    this.props.plugins.filter((item) => item.groupType !== AUTHORIZATION_GROUP_TYPE);

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <PluginsTabs plugins={this.getPlugins()} filterItems={this.getFilterItems()} />
        </PageSection>
      </PageLayout>
    );
  }
}
