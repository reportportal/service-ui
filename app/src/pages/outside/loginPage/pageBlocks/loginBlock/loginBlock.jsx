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

import { defineMessages, FormattedMessage } from 'react-intl';
import { PageBlockContainer } from 'pages/outside/common/pageBlockContainer';
import React from 'react';
import { isEmptyObject } from 'common/utils';
import { ExtensionLoader } from 'components/extensionLoader';
import { useSelector } from 'react-redux';
import { authExtensionsSelector } from 'controllers/appInfo';
import classNames from 'classnames/bind';
import { uiExtensionLoginPageSelector } from 'controllers/plugins/uiExtensions';
import { pagePropertiesSelector } from 'controllers/pages';
import { ExternalLoginBlock } from './loginForm/externalLoginBlock';
import styles from './loginBlock.scss';
import { LoginForm } from './loginForm';

const cx = classNames.bind(styles);

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

export const LoginBlock = () => {
  const externalAuth = useSelector(authExtensionsSelector);
  const extensions = useSelector(uiExtensionLoginPageSelector);
  const pageProps = useSelector(pagePropertiesSelector);
  const auth = pageProps.auth;

  return (
    <PageBlockContainer header={messages.welcome} hint={messages.login}>
      {!isEmptyObject(externalAuth) ? (
        <>
          <ExternalLoginBlock externalAuth={externalAuth} />
          <div className={cx('separator')}>
            <div className={cx('line')} />
            <div className={cx('or')}>
              <FormattedMessage id={'LoginForm.or'} defaultMessage={'or'} />
            </div>
          </div>
        </>
      ) : null}
      {extensions && extensions.length !== 0 ? (
        extensions.map((extension) => (
          <ExtensionLoader extension={extension} components={{ LoginForm }} initAuthFlow={auth} />
        ))
      ) : (
        <LoginForm />
      )}
    </PageBlockContainer>
  );
};
