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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Link from 'redux-first-router-link';
import { Button, useEllipsisTitle } from '@reportportal/ui-kit';
import { authExtensionsSelector } from 'controllers/appInfo';
import { LOGIN_PAGE } from 'controllers/pages';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { normalizePathWithPrefix, setWindowLocationToNewPath } from 'pages/outside/common/utils';
import styles from './multipleAuthBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  welcome: {
    id: 'LoginBlock.welcome',
    defaultMessage: 'Welcome',
  },
  selectSamlProvider: {
    id: 'MultipleAuthBlock.selectSamlProvider',
    defaultMessage: 'Select SAML provider you want to log in:',
  },
  logInWithEmail: {
    id: 'MultipleAuthBlock.logInWithEmail',
    defaultMessage: 'Log in with Email',
  },
  wrongAuthType: {
    id: 'MultipleAuthBlock.wrongAuthType',
    defaultMessage: "Couldn't find ''{authType}'' auth type",
  },
});

const ProviderButton = ({ label, onClick }) => {
  const { ref, title } = useEllipsisTitle(label);

  return (
    <div className={cx('provider-button')}>
      <Button variant="ghost" className={cx('provider-action-button')} onClick={onClick}>
        <span ref={ref} title={title} className={cx('provider-name')}>
          {label}
        </span>
      </Button>
    </div>
  );
};
ProviderButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

@connect((state) => ({
  externalAuthExtensions: authExtensionsSelector(state),
}))
@track()
@injectIntl
export class MultipleAuthBlock extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    multipleAuthKey: PropTypes.string,
    externalAuthExtensions: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    multipleAuthKey: '',
    externalAuthExtensions: {},
  };

  static getDerivedStateFromProps(props, state) {
    if (props.multipleAuthKey !== state.multipleAuthKey) {
      const { externalAuthExtensions, multipleAuthKey } = props;
      const externalAuth = externalAuthExtensions[multipleAuthKey];
      let selectedAuthPath = null;
      let authOptions = [];
      if (externalAuth) {
        const providers = externalAuth.providers;
        authOptions = Object.keys(providers).map((key) => ({
          value: providers[key],
          label: key,
        }));
        selectedAuthPath = authOptions[0].value;
      }

      return {
        multipleAuthKey,
        selectedAuthPath,
        authOptions,
      };
    }

    return null;
  }

  state = {
    selectedAuthPath: null,
    multipleAuthKey: null,
    authOptions: [],
    authInProgress: false,
  };

  getProviderClickHandler = (selectedAuthPath) => () => {
    const { multipleAuthKey, tracking } = this.props;
    tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(multipleAuthKey));

    this.setState({ authInProgress: true });
    setWindowLocationToNewPath(normalizePathWithPrefix(selectedAuthPath));
  };

  render() {
    const { authOptions, authInProgress } = this.state;
    const {
      intl: { formatMessage },
      multipleAuthKey,
    } = this.props;

    return (
      <PageSectionContainer header={messages.welcome} hint={messages.selectSamlProvider} leftAligned>
        <div className={cx('multiple-auth-block')}>
          {authInProgress ? (
            <SpinningPreloader />
          ) : (
            <>
              {authOptions.length ? (
                <div className={cx('provider-buttons')}>
                  {authOptions.map((option) => (
                    <ProviderButton
                      key={option.label}
                      label={option.label}
                      onClick={this.getProviderClickHandler(option.value)}
                    />
                  ))}
                </div>
              ) : (
                formatMessage(messages.wrongAuthType, { authType: multipleAuthKey })
              )}
              <div className={cx('log-in-with-email')}>
                <Link to={{ type: LOGIN_PAGE }} className={cx('log-in-with-email-link')}>
                  <FormattedMessage {...messages.logInWithEmail} />
                </Link>
              </div>
            </>
          )}
        </div>
      </PageSectionContainer>
    );
  }
}
