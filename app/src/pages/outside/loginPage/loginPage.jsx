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

import React, { PureComponent } from 'react';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { referenceDictionary, connectRouter } from 'common/utils';
import { showDefaultErrorNotification } from 'controllers/notification';
import { uiExtensionLoginPageSelector } from 'controllers/plugins/uiExtensions';
import { ExtensionLoader } from 'components/extensionLoader';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { EPAM, SAAS } from 'controllers/appInfo/constants';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { LOGIN_PAGE } from 'components/main/analytics/events';
import styles from './loginPage.scss';
import { LoginPageSection } from './loginPageSection';
import { SocialSection } from './socialSection';
import { LoginBlock } from './pageBlocks/loginBlock';
import { ForgotPasswordBlock } from './pageBlocks/forgotPasswordBlock';
import { ChangePasswordBlock } from './pageBlocks/changePasswordBlock';
import { ServiceVersionsBlock } from './pageBlocks/serviceVersionsBlock';
import { MultipleAuthBlock } from './pageBlocks/multipleAuthBlock';
import { PolicyBlock } from './pageBlocks/policyBlock';

const cx = classNames.bind(styles);

@connectRouter(({ forgotPass, reset, errorAuth, multipleAuth, registration }) => ({
  forgotPass,
  reset,
  errorAuth,
  multipleAuth,
  registration,
}))
@connect(
  (state) => ({
    extensions: uiExtensionLoginPageSelector(state),
    instanceType: instanceTypeSelector(state),
  }),
  {
    showDefaultErrorNotification,
  },
)
@track({ page: LOGIN_PAGE })
export class LoginPage extends PureComponent {
  static propTypes = {
    forgotPass: PropTypes.string,
    reset: PropTypes.string,
    errorAuth: PropTypes.string,
    multipleAuth: PropTypes.string,
    registration: PropTypes.string,
    extensions: PropTypes.array,
    showDefaultErrorNotification: PropTypes.func,
    instanceType: PropTypes.string.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    forgotPass: '',
    reset: '',
    errorAuth: '',
    multipleAuth: '',
    registration: '',
    extensions: [],
    showDefaultErrorNotification: () => {},
  };

  componentDidMount() {
    if (this.props.errorAuth) {
      this.props.showDefaultErrorNotification({
        message: this.props.errorAuth,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.errorAuth !== prevProps.errorAuth) {
      this.props.showDefaultErrorNotification({
        message: this.props.errorAuth,
      });
    }
  }

  getCurrentBlock = () => {
    const { forgotPass, reset, multipleAuth, registration, extensions } = this.props;

    let currentBlock = <LoginBlock />;
    if (forgotPass) {
      currentBlock = <ForgotPasswordBlock />;
    }
    if (reset) {
      currentBlock = <ChangePasswordBlock />;
    }
    if (multipleAuth) {
      currentBlock = <MultipleAuthBlock multipleAuthKey={multipleAuth} />;
    }
    if (registration && extensions) {
      currentBlock = extensions.map((extension) => (
        <ExtensionLoader key={extension.name} extension={extension} withPreloader />
      ));
    }

    return currentBlock;
  };

  render() {
    const { registration, instanceType, tracking } = this.props;
    const currentBlock = this.getCurrentBlock();

    return (
      <div className={cx('login-page')}>
        <div className={cx('login-page-content')}>
          <div className={cx('background')} />
          <a
            href={referenceDictionary.rpLanding}
            target="_blank"
            onClick={() => tracking.trackEvent(LOGIN_PAGE_EVENTS.CLICK_ON_RPP_LOGO)}
          >
            <div className={cx('logo')} />
          </a>
          <LoginPageSection left>
            <SocialSection />
          </LoginPageSection>
          <LoginPageSection>
            {currentBlock}
            {!registration && <ServiceVersionsBlock />}
            {(instanceType === EPAM || instanceType === SAAS) && <PolicyBlock />}
          </LoginPageSection>
        </div>
      </div>
    );
  }
}
