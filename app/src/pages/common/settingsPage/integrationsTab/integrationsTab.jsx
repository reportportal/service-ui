import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import {
  IntegrationInfoContainer,
  IntegrationSettingsContainer,
} from 'components/integrations/containers';
import { showDefaultErrorNotification } from 'controllers/notification';
import { availableGroupedPluginsSelector } from 'controllers/plugins';
import { INTEGRATION_NAMES_TITLES } from 'components/integrations';
import { IntegrationsList } from './integrationsList';
import { IntegrationBreadcrumbs } from './integrationBreadcrumbs';
import {
  INTEGRATION_SUBPAGE,
  INTEGRATION_SETTINGS_SUBPAGE,
  SUB_PAGES_SEQUENCE,
  DEFAULT_BREADCRUMB,
} from './constants';
import styles from './integrationsTab.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    availablePlugins: availableGroupedPluginsSelector(state),
  }),
  {
    showDefaultErrorNotification,
  },
)
export class IntegrationsTab extends Component {
  static propTypes = {
    showDefaultErrorNotification: PropTypes.func.isRequired,
    availablePlugins: PropTypes.object.isRequired,
  };

  state = {
    subPage: DEFAULT_BREADCRUMB,
  };

  getBreadcrumbs = () => {
    const { subPage } = this.state;
    const breadcrumbs = [DEFAULT_BREADCRUMB];

    SUB_PAGES_SEQUENCE.some((pageType) => {
      const cachedPage = this.subPagesCache[pageType];
      const isLastPage = pageType === subPage.type;
      breadcrumbs.push(isLastPage ? subPage : cachedPage);

      return isLastPage;
    });
    return breadcrumbs;
  };

  getPageContent = () => {
    const { type, data, title } = this.state.subPage;

    switch (type) {
      case INTEGRATION_SUBPAGE:
        return (
          <IntegrationInfoContainer
            integrationType={data}
            onItemClick={(pageData, pageTitle) =>
              this.changeSubPage({
                type: INTEGRATION_SETTINGS_SUBPAGE,
                data: pageData,
                title: pageTitle,
              })
            }
          />
        );
      case INTEGRATION_SETTINGS_SUBPAGE:
        return (
          <IntegrationSettingsContainer
            data={data}
            title={title}
            goToPreviousPage={() => this.changeSubPage(this.subPagesCache[INTEGRATION_SUBPAGE])}
          />
        );
      default:
        return (
          <IntegrationsList
            onItemClick={(pageData) =>
              this.changeSubPage({
                type: INTEGRATION_SUBPAGE,
                data: pageData,
                title: INTEGRATION_NAMES_TITLES[pageData.name] || pageData.name,
              })
            }
            availableIntegrations={this.props.availablePlugins}
          />
        );
    }
  };

  subPagesCache = {};

  changeSubPage = (subPage) => {
    this.subPagesCache[subPage.type] = subPage;
    this.setState({ subPage });
  };

  render() {
    const { subPage } = this.state;

    return (
      <div className={cx('integrations-tab')}>
        {subPage.type && (
          <IntegrationBreadcrumbs
            descriptors={this.getBreadcrumbs()}
            onClickItem={this.changeSubPage}
          />
        )}
        {this.getPageContent()}
      </div>
    );
  }
}
