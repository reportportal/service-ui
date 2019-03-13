import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { integrationNamesTitles } from 'common/constants/integrationNamesTitles';
import {
  IntegrationInfoContainer,
  IntegrationSettingsContainer,
} from 'components/integrations/containers';
import { showDefaultErrorNotification } from 'controllers/notification';
import { sortItemsByGroupType, groupItems, filterAvailablePlugins } from 'controllers/project';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
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

@connect(null, {
  showDefaultErrorNotification,
})
export class IntegrationsTab extends Component {
  static propTypes = {
    showDefaultErrorNotification: PropTypes.func.isRequired,
  };

  state = {
    loading: true,
    subPage: DEFAULT_BREADCRUMB,
    availableIntegrations: {},
  };

  componentDidMount() {
    this.fetchAvailableIntegrations();
  }

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
    const { type, data } = this.state.subPage;

    switch (type) {
      case INTEGRATION_SUBPAGE:
        return (
          <IntegrationInfoContainer
            integrationType={data}
            onItemClick={(pageData) =>
              this.changeSubPage({
                type: INTEGRATION_SETTINGS_SUBPAGE,
                data: pageData,
                title: integrationNamesTitles[pageData.name] || pageData.id,
              })
            }
          />
        );
      case INTEGRATION_SETTINGS_SUBPAGE:
        return (
          <IntegrationSettingsContainer
            data={data}
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
                title: integrationNamesTitles[pageData.name] || pageData.name,
              })
            }
            availableIntegrations={this.state.availableIntegrations}
          />
        );
    }
  };

  fetchAvailableIntegrations = () => {
    fetch(URLS.plugin())
      .then((plugins) => {
        let availableIntegrations = filterAvailablePlugins(plugins);
        availableIntegrations = sortItemsByGroupType(availableIntegrations);
        availableIntegrations = groupItems(availableIntegrations);

        this.setState({
          availableIntegrations,
          loading: false,
        });
      })
      .catch((error) => {
        this.props.showDefaultErrorNotification(error);
        this.setState({
          loading: false,
        });
      });
  };

  subPagesCache = {};

  changeSubPage = (subPage) => {
    this.subPagesCache[subPage.type] = subPage;
    this.setState({ subPage });
  };

  render() {
    const { subPage, loading } = this.state;

    return (
      <div className={cx('integrations-tab')}>
        {subPage.type && (
          <IntegrationBreadcrumbs
            descriptors={this.getBreadcrumbs()}
            onClickItem={this.changeSubPage}
          />
        )}
        {loading ? <SpinningPreloader /> : this.getPageContent()}
      </div>
    );
  }
}
