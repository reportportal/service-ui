import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { ToggleButton } from 'components/buttons/toggleButton';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import { TOKEN_KEY } from 'controllers/auth';
import { URLS, DEFAULT_API_URL_PREFIX, UAT_API_URL_PREFIX } from 'common/urls';
import styles from './apiPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  apiPageTitle: {
    id: 'ApiPage.title',
    defaultMessage: 'API Documentation',
  },
});

@injectIntl
export class ApiPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  };

  state = {
    apiType: DEFAULT_API_URL_PREFIX,
  };

  componentDidMount() {
    this.createSwagger(this.state.apiType);
  }

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.apiPageTitle) }];

  tabChangeHandle = (apiType) => {
    this.setState({
      apiType,
    });
    this.createSwagger(apiType);
  };

  createSwagger = (apiType) => {
    SwaggerUI({
      url: URLS.apiDocs(apiType),
      dom_id: '#swagger',
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'],
      validatorUrl: null,
      docExpansion: 'none',
      apisSorter: 'alpha',
      jsonEditor: false,
      defaultModelRendering: 'schema',
      showRequestHeaders: false,
      showOperationIds: false,
      configs: {
        preFetch: (request) => {
          request.headers.Authorization = localStorage.getItem(TOKEN_KEY);
          return request;
        },
      },
    });
  };

  tabItems = [
    {
      value: DEFAULT_API_URL_PREFIX,
      label: 'API',
    },
    {
      value: UAT_API_URL_PREFIX,
      label: 'UAT',
    },
  ];

  render() {
    return (
      <PageLayout>
        <PageHeader breadcrumbs={this.getBreadcrumbs()} />
        <PageSection>
          <div className={cx('api-page-content-wrapper')}>
            <div className={cx('api-type-switcher')}>
              <div className={cx('switcher-wrapper')}>
                <ToggleButton
                  items={this.tabItems}
                  value={this.state.apiType}
                  onChange={this.tabChangeHandle}
                />
              </div>
            </div>
            <div id="swagger" className={cx('swagger-wrapper')} />
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
