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

import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { redirect } from 'redux-first-router';
import { authExtensionsSelector } from 'controllers/appInfo';
import { LOGIN_PAGE } from 'controllers/pages';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { OutsideLoginFooter } from 'pages/outside/common/outsideLoginFooter';
import { normalizePathWithPrefix, setWindowLocationToNewPath } from 'pages/outside/common/utils';
import { ProviderButton } from '../providerButton';
import { ProviderButtonsGrid } from '../providerButtonsGrid';
import styles from './selectSsoProviderBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  welcome: {
    id: 'LoginBlock.welcome',
    defaultMessage: 'Welcome',
  },
  hint: {
    id: 'SelectSsoProviderBlock.hint',
    defaultMessage: 'Select SSO provider you want to login:',
  },
  logInWithEmail: {
    id: 'SelectSsoProviderBlock.logInWithEmail',
    defaultMessage: 'Log in with Email',
  },
});

export const SelectSsoProviderBlock = () => {
  const externalAuth = useSelector(authExtensionsSelector);
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const [authInProgress, setAuthInProgress] = useState(false);

  const authTypes = Object.keys(externalAuth);

  useEffect(() => {
    if (authTypes.length <= 1) {
      dispatch(redirect({ type: LOGIN_PAGE }));
    }
  }, [authTypes.length, dispatch]);

  const handleProviderClick = useCallback(
    (authType, val) => () => {
      trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(authType));

      if (val.providers && Object.keys(val.providers).length > 1) {
        dispatch(redirect({ type: LOGIN_PAGE, payload: { query: { multipleAuth: authType } } }));
        return;
      }

      const path = val.path || (val.providers && Object.values(val.providers)[0]);

      if (path) {
        setAuthInProgress(true);
        setWindowLocationToNewPath(normalizePathWithPrefix(path));
      }
    },
    [dispatch, trackEvent],
  );

  if (authTypes.length <= 1) {
    return null;
  }

  return (
    <>
      <PageSectionContainer header={messages.welcome} hint={messages.hint} leftAligned>
        <div className={cx('select-sso-provider-block')}>
          {authInProgress ? (
            <SpinningPreloader />
          ) : (
            <>
              <ProviderButtonsGrid>
                {authTypes.map((authType) => (
                  <ProviderButton
                    key={authType}
                    label={authType.toUpperCase()}
                    onClick={handleProviderClick(authType, externalAuth[authType])}
                  />
                ))}
              </ProviderButtonsGrid>
              <div className={cx('log-in-with-email')}>
                <Link to={{ type: LOGIN_PAGE }} className={cx('log-in-with-email-link')}>
                  <FormattedMessage {...messages.logInWithEmail} />
                </Link>
              </div>
            </>
          )}
        </div>
      </PageSectionContainer>
      <OutsideLoginFooter />
    </>
  );
};
