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
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { fetch, connectRouter } from 'common/utils';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { OutsideLoginFooter } from 'pages/outside/common/outsideLoginFooter';
import { ChangePasswordForm } from './changePasswordForm';

const messages = defineMessages({
  changePass: {
    id: 'ChangePasswordBlock.changePass',
    defaultMessage: 'Change password',
  },
  enterEmail: {
    id: 'ChangePasswordBlock.enterEmail',
    defaultMessage: 'Enter new password and confirm it:',
  },
});

const ChangePasswordBlockComponent = ({ reset }) => {
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

  useEffect(() => {
    if (!loading && !valid) {
      dispatch(rfrRedirect({ type: LOGIN_PAGE }));
    }
  }, [dispatch, loading, valid]);

  if (loading) {
    return <SpinningPreloader />;
  }

  if (!valid) {
    return null;
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

ChangePasswordBlockComponent.defaultProps = {
  reset: '',
};

export const ChangePasswordBlock = connectRouter(({ reset }) => ({ reset }))(
  ChangePasswordBlockComponent,
);
