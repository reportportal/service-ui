import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SwaggerUI from 'swagger-ui';
import 'swagger-ui/dist/swagger-ui.css';
import { URLS, DEFAULT_API_URL_PREFIX, UAT_API_URL_PREFIX } from 'common/urls';
import { tokenSelector } from 'controllers/auth';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { ToggleButton } from 'components/buttons/toggleButton';
import styles from './apiPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  apiPageTitle: {
    id: 'ApiPage.title',
    defaultMessage: 'API Documentation',
  },
});

@connect((state) => ({
  token: tokenSelector(state),
}))
@injectIntl
export class ApiPage extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    token: PropTypes.string.isRequired,
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
          request.headers.Authorization = this.props.token;
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
