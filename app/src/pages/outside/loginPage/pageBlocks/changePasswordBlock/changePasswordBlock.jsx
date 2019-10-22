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
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { redirect as rfrRedirect } from 'redux-first-router';
import { fetch, connectRouter } from 'common/utils';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import { isAuthorizedSelector } from 'controllers/auth';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { PageBlockContainer } from 'pages/outside/common/pageBlockContainer';
import { ChangePasswordForm } from './changePasswordForm';

const messages = defineMessages({
  changePass: {
    id: 'ChangePasswordBlock.changePass',
    defaultMessage: 'Change password',
  },
  enterEmail: {
    id: 'ChangePasswordBlock.enterEmail',
    defaultMessage: 'enter new password and confirm it',
  },
});

@connectRouter(({ reset }) => ({ reset }))
@connect(
  (state) => ({
    authorized: isAuthorizedSelector(state),
  }),
  (dispatch) => ({
    redirectToLoginPage: () => dispatch(rfrRedirect({ type: LOGIN_PAGE })),
  }),
)
export class ChangePasswordBlock extends PureComponent {
  static propTypes = {
    reset: PropTypes.string,
    redirectToLoginPage: PropTypes.func.isRequired,
  };
  static defaultProps = {
    reset: '',
  };
  state = {
    loading: true,
    valid: true,
  };
  componentDidMount() {
    fetch(URLS.userPasswordResetToken(this.props.reset), {
      method: 'get',
    }).then((response) => {
      this.setState({ valid: response.is, loading: false });
    });
  }
  render() {
    if (!this.state.loading && !this.state.valid) {
      this.props.redirectToLoginPage();
    }

    // eslint-disable-next-line no-nested-ternary
    return this.state.loading ? (
      <SpinningPreloader />
    ) : (
      <PageBlockContainer header={messages.changePass} hint={messages.enterEmail}>
        <ChangePasswordForm />
      </PageBlockContainer>
    );
  }
}
