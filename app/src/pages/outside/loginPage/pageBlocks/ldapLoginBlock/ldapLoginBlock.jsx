/*
 * Copyright 2026 EPAM Systems
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

import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { redirect } from 'redux-first-router';
import { authExtensionsSelector } from 'controllers/appInfo';
import { lastFailedLoginTimeSelector } from 'controllers/auth';
import { getLoginLockoutState } from 'controllers/auth/loginLockout';
import { LOGIN_PAGE } from 'controllers/pages';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { OutsideLoginFooter } from 'pages/outside/common/outsideLoginFooter';
import { isLdapAuthType } from 'pages/outside/common/utils';
import { LdapLoginForm } from '../loginBlock/loginForm/loginForm';

const messages = defineMessages({
  welcome: {
    id: 'LoginBlock.welcome',
    defaultMessage: 'Welcome',
  },
  hint: {
    id: 'LdapLoginBlock.hint',
    defaultMessage: 'Enter LDAP email and password to log in with LDAP',
  },
});

export const LdapLoginBlock = () => {
  const externalAuth = useSelector(authExtensionsSelector) || {};
  const lastFailedLoginTime = useSelector(lastFailedLoginTimeSelector);
  const dispatch = useDispatch();

  const hasLdap = Object.keys(externalAuth).some(isLdapAuthType);
  const { isLoginLimitExceeded } = getLoginLockoutState(lastFailedLoginTime);

  useEffect(() => {
    if (!hasLdap) {
      dispatch(redirect({ type: LOGIN_PAGE }));
    }
  }, [dispatch, hasLdap]);

  if (!hasLdap) {
    return null;
  }

  return (
    <>
      <PageSectionContainer
        hideHeader={isLoginLimitExceeded}
        header={messages.welcome}
        hint={messages.hint}
        leftAligned
      >
        <LdapLoginForm />
      </PageSectionContainer>
      <OutsideLoginFooter />
    </>
  );
};
