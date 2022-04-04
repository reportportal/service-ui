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

import { defineMessages } from 'react-intl';
import { PageBlockContainer } from 'pages/outside/common/pageBlockContainer';
import { connect } from 'react-redux';
import { PureComponent } from 'react';
import { ExtensionLoader, extensionType } from 'components/extensionLoader';
import { uiExtensionLoginPageSelector } from 'controllers/plugins/uiExtensions';
import PropTypes from 'prop-types';
import { LoginForm } from './loginForm';

const messages = defineMessages({
  welcome: {
    id: 'LoginBlock.welcome',
    defaultMessage: 'Welcome,',
  },
  login: {
    id: 'LoginBlock.login',
    defaultMessage: 'login to your account',
  },
});

@connect(
  (state) => ({
    extensions: uiExtensionLoginPageSelector(state),
  }),
  {},
)
export class LoginBlock extends PureComponent {
  static propTypes = {
    extensions: PropTypes.arrayOf(extensionType),
  };
  static defaultProps = {
    extensions: [],
  };

  getLoginPageExtensions = () => {
    const { extensions } = this.props;

    return extensions.reduce(
      (acc, extension) => ({
        ...acc,
        [extension.name]: {
          name: extension.title || extension.name,
          // TODO link generation
          link: '/signUp',
          component: <ExtensionLoader extension={extension} />,
          mobileDisabled: true,
        },
      }),
      {},
    );
  };

  render() {
    return (
      <PageBlockContainer header={messages.welcome} hint={messages.login}>
        <LoginForm />
        {this.getLoginPageExtensions().signUp && this.getLoginPageExtensions().signUp.component}
      </PageBlockContainer>
    );
  }
}
