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

import { useCallback, useState } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { redirect } from 'redux-first-router';
import { FormattedMessage, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Button } from '@reportportal/ui-kit';
import { LOGIN_PAGE } from 'controllers/pages';
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  isLdapAuthType,
  normalizePathWithPrefix,
  setWindowLocationToNewPath,
} from 'pages/outside/common/utils';
import styles from './externalLoginBlock.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  loginWithSso: {
    id: 'ExternalLoginBlock.loginWithSso',
    defaultMessage: 'Login with SSO',
  },
});

export const ExternalLoginBlock = ({ externalAuth = {}, inline = false }) => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const [authInProgress, setAuthInProgress] = useState(false);

  const startAuthFlow = useCallback(
    (val, authType) => {
      if (!val) {
        return;
      }

      if (isLdapAuthType(authType)) {
        dispatch(redirect({ type: LOGIN_PAGE, payload: { query: { ldapLogin: 'true' } } }));
        return;
      }

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
    [dispatch],
  );

  const handleSsoClick = useCallback(() => {
    const authTypes = Object.keys(externalAuth);

    if (authTypes.length > 1) {
      dispatch(redirect({ type: LOGIN_PAGE, payload: { query: { selectSso: 'true' } } }));
      return;
    }

    const [authType] = authTypes;
    const val = externalAuth[authType];

    if (!val) {
      return;
    }

    trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(authType));
    startAuthFlow(val, authType);
  }, [dispatch, externalAuth, startAuthFlow, trackEvent]);

  if (authInProgress) {
    return <SpinningPreloader />;
  }

  if (Object.keys(externalAuth).length === 0) {
    return null;
  }

  return (
    <div className={cx('external-login-block', { inline })}>
      <Button variant="ghost" className={cx('sso-button')} onClick={handleSsoClick}>
        <FormattedMessage {...messages.loginWithSso} />
      </Button>
    </div>
  );
};

ExternalLoginBlock.propTypes = {
  externalAuth: PropTypes.object,
  inline: PropTypes.bool,
};
