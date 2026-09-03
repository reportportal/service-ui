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

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { Button } from '@reportportal/ui-kit';
import { fetch, connectRouter, docsReferences, createClassnames } from 'common/utils';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { OutsideLoginFooter } from 'pages/outside/common/outsideLoginFooter';
import { ChangePasswordForm } from './changePasswordForm';
import styles from './changePasswordBlock.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  changePass: {
    id: 'ChangePasswordBlock.changePass',
    defaultMessage: 'Change password',
  },
  enterEmail: {
    id: 'ChangePasswordBlock.enterEmail',
    defaultMessage: 'Enter new password and confirm it:',
  },
  tokenExpired: {
    id: 'ChangePasswordBlock.tokenExpired',
    defaultMessage: 'This restore password link has expired or already used.',
  },
  backToLogin: {
    id: 'ChangePasswordBlock.backToLogin',
    defaultMessage: 'Back to Log In',
  },
  restorePassword: {
    id: 'ChangePasswordBlock.restorePassword',
    defaultMessage: 'Restore Password',
  },
  readMore: {
    id: 'ChangePasswordBlock.readMore',
    defaultMessage: 'Read more',
  },
});

const InvalidTokenActions = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <div className={cx('fail-actions')}>
      <div className={cx('fail-buttons')}>
        <Button
          variant="primary"
          adjustWidthOn="content"
          onClick={() => dispatch({ type: LOGIN_PAGE })}
        >
          {formatMessage(messages.backToLogin)}
        </Button>
        <Button
          variant="ghost"
          adjustWidthOn="content"
          onClick={() => dispatch({ type: LOGIN_PAGE, payload: { query: { forgotPass: 'true' } } })}
        >
          {formatMessage(messages.restorePassword)}
        </Button>
      </div>
      <Button
        variant="text"
        adjustWidthOn="content"
        onClick={() => {
          window.open(docsReferences.restorePassword, '_blank', 'noopener,noreferrer');
        }}
      >
        {formatMessage(messages.readMore)}
      </Button>
    </div>
  );
};

const ChangePasswordBlockComponent = ({ reset = '' }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    if (!reset) {
      dispatch(rfrRedirect({ type: LOGIN_PAGE }));
      return;
    }

    let isMounted = true;

    fetch(URLS.userPasswordResetToken(reset), {
      method: 'get',
    })
      .then((response) => {
        if (isMounted) {
          setValid(response.is);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setValid(false);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, reset]);

  if (loading) {
    return <SpinningPreloader />;
  }

  if (!valid) {
    return (
      <>
        <PageSectionContainer
          header={COMMON_LOCALE_KEYS.OOPS}
          hint={messages.tokenExpired}
          leftAligned
        >
          <InvalidTokenActions />
        </PageSectionContainer>
        <OutsideLoginFooter />
      </>
    );
  }

  return (
    <>
      <PageSectionContainer header={messages.changePass} hint={messages.enterEmail} leftAligned>
        <ChangePasswordForm />
      </PageSectionContainer>
      <OutsideLoginFooter />
    </>
  );
};

ChangePasswordBlockComponent.propTypes = {
  reset: PropTypes.string,
};

export const ChangePasswordBlock = connectRouter(({ reset }) => ({ reset }))(
  ChangePasswordBlockComponent,
);
