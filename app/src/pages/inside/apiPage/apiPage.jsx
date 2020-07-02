/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
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
    intl: PropTypes.object.isRequired,
    token: PropTypes.string.isRequired,
  };

  state = {
    apiType: DEFAULT_API_URL_PREFIX,
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.apiPageTitle) }];

  tabChangeHandler = (apiType) => {
    this.setState({
      apiType,
    });
  };

  setAuth = (request) => {
    request.headers.Authorization = this.props.token;
    return request;
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
    const { apiType } = this.state;

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
                  onChange={this.tabChangeHandler}
                />
              </div>
            </div>
            <SwaggerUI
              url={URLS.apiDocs(apiType)}
              validatorUrl={null}
              docExpansion="none"
              apisSorter="alpha"
              jsonEditor={false}
              defaultModelRendering="schema"
              showRequestHeaders={false}
              showOperationIds={false}
              requestInterceptor={this.setAuth}
              supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch', 'head', 'options']}
            />
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
