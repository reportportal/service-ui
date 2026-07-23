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
import { isEmptyObject } from 'common/utils';
import { ExtensionLoader } from 'components/extensionLoader';
import { useSelector } from 'react-redux';
import { authExtensionsSelector } from 'controllers/appInfo';
import { lastFailedLoginTimeSelector } from 'controllers/auth';
import { getLoginLockoutState } from 'controllers/auth/loginLockout';
import classNames from 'classnames/bind';
import { uiExtensionLoginBlockSelector } from 'controllers/plugins/uiExtensions';
import { isSoleLdapAuth } from 'pages/outside/common/utils';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import styles from './loginBlock.scss';
import { LoginForm } from './loginForm';

const cx = classNames.bind(styles);

const messages = defineMessages({
  welcome: {
    id: 'LoginBlock.welcome',
    defaultMessage: 'Welcome',
  },
  login: {
    id: 'LoginBlock.login',
    defaultMessage: 'Enter your email and password to log in:',
  },
});

export const LoginBlock = () => {
  const externalAuth = useSelector(authExtensionsSelector);
  const extensions = useSelector(uiExtensionLoginBlockSelector);
  const lastFailedLoginTime = useSelector(lastFailedLoginTimeSelector);
  const { isLoginLimitExceeded } = getLoginLockoutState(lastFailedLoginTime);
  const showExternalAuth =
    !isLoginLimitExceeded && !isEmptyObject(externalAuth) && !isSoleLdapAuth(externalAuth);

  return (
    <>
      <PageSectionContainer
        hideHeader={isLoginLimitExceeded}
        header={messages.welcome}
        hint={messages.login}
        leftAligned
      >
        <LoginForm externalAuth={showExternalAuth ? externalAuth : null} />
      </PageSectionContainer>
      <div className={cx('bottom-content')}>
        {extensions &&
          extensions.length !== 0 &&
          extensions.map((extension) => <ExtensionLoader key={extension.name} extension={extension} />)}
      </div>
    </>
  );
};
