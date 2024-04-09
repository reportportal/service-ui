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
import { tokenTypeSelector, tokenValueSelector } from 'controllers/auth';
import { PageLayout, PageHeader, PageSection } from 'layouts/pageLayout';
import { ToggleButton } from 'components/buttons/toggleButton';
import track from 'react-tracking';
import { API_DOCUMENTATION_PAGE_EVENTS } from 'analyticsEvents/apiDocumentationPageEvents';
import styles from './apiPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  apiPageTitle: {
    id: 'ApiPage.title',
    defaultMessage: 'API Documentation',
  },
});

const OPTION_BLOCK_TAG_SECTION = '.opblock-tag-section';
const OPTION_BLOCK_TAG_SECTION_OPEN = '.opblock-tag-section.is-open';
const OPTION_BLOCK_TAG = '.opblock-tag';
const OPTION_BLOCK_TAG_OPEN = '.opblock.is-open';
const OPTION_BLOCK_SUMMARY = '.opblock-summary';
const TOKEN_TYPE = {
  BEARER: 'bearer',
  APIKEY: 'apikey', // TODO check this value after apikey authorisation implementation
};
const SECURITY_SCHEMES_KEYS_NAME = {
  BEARER: 'bearerAuth',
  APIKEY: 'api_key',
};

@connect((state) => ({
  tokenType: tokenTypeSelector(state),
  tokenValue: tokenValueSelector(state),
}))
@injectIntl
@track()
export class ApiPage extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    tokenType: PropTypes.string.isRequired,
    tokenValue: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  state = {
    apiType: DEFAULT_API_URL_PREFIX,
  };

  onSwaggerRendering = (system) => {
    if (this.props.tokenType === TOKEN_TYPE.BEARER) {
      system.preauthorizeApiKey(SECURITY_SCHEMES_KEYS_NAME.BEARER, this.props.tokenValue);
    } else if (this.props.tokenType === TOKEN_TYPE.APIKEY) {
      system.preauthorizeApiKey(SECURITY_SCHEMES_KEYS_NAME.APIKEY, this.props.tokenValue);
    }
  };

  getBreadcrumbs = () => [{ title: this.props.intl.formatMessage(messages.apiPageTitle) }];

  getAPIName = (apiType) => apiType.split('/')[1];

  tabChangeHandler = (apiType) => {
    const { trackEvent } = this.props.tracking;
    const apiName = this.getAPIName(apiType);
    trackEvent(API_DOCUMENTATION_PAGE_EVENTS.CLICK_CHANGE_DOCUMENTATION_TYPE(apiName));

    this.setState({
      apiType,
    });
  };

  setAuth = (request) => {
    if (!request.headers.Authorization) {
      request.headers.Authorization = `${this.props.tokenType} ${this.props.tokenValue}`;
    }
    return request;
  };

  handleSwaggerControllerExpand = (target) => {
    const { trackEvent } = this.props.tracking;

    const {
      dataset: { tag },
    } = target.closest(OPTION_BLOCK_TAG);

    trackEvent(
      API_DOCUMENTATION_PAGE_EVENTS.CLICK_CONTROLLER_BLOCK(
        this.getAPIName(this.state.apiType),
        tag,
      ),
    );
  };

  handleSwaggerOptionBlockExpand = (target) => {
    const { trackEvent } = this.props.tracking;

    const {
      dataset: { tag },
    } = target.closest(OPTION_BLOCK_TAG_SECTION).firstElementChild;

    const [{ textContent }] = target.closest(OPTION_BLOCK_SUMMARY).firstElementChild.children;

    trackEvent(
      API_DOCUMENTATION_PAGE_EVENTS.CLICK_OPTION_BLOCK({
        place: this.getAPIName(this.state.apiType),
        type: tag,
        condition: textContent,
      }),
    );
  };

  handleClick = ({ target }) => {
    if (!target.closest(OPTION_BLOCK_TAG_SECTION)) {
      return;
    }

    if (target.closest(OPTION_BLOCK_SUMMARY) && !target.closest(OPTION_BLOCK_TAG_OPEN)) {
      this.handleSwaggerOptionBlockExpand(target);
      return;
    }

    if (!target.closest(OPTION_BLOCK_TAG_SECTION_OPEN)) {
      this.handleSwaggerControllerExpand(target);
    }
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
                  value={apiType}
                  onChange={this.tabChangeHandler}
                />
              </div>
            </div>
            <div onClick={this.handleClick}>
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
                supportedSubmitMethods={[
                  'get',
                  'post',
                  'put',
                  'delete',
                  'patch',
                  'head',
                  'options',
                ]}
                onComplete={this.onSwaggerRendering}
              />
            </div>
          </div>
        </PageSection>
      </PageLayout>
    );
  }
}
