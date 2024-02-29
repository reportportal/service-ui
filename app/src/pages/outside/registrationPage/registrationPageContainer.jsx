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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { connectRouter, fetch } from 'common/utils';
import { loginAction } from 'controllers/auth';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { URLS } from 'common/urls';
import { uiExtensionRegistrationPageSelector } from 'controllers/plugins/uiExtensions';
import { ExtensionLoader } from 'components/extensionLoader';
import { pagePropertiesSelector } from 'controllers/pages';
import { RegistrationPage } from './registrationPage';

const TYPE_SIGNUP = 'signup';

@connect(
  (state) => ({
    extensions: uiExtensionRegistrationPageSelector(state),
    pageProps: pagePropertiesSelector(state),
  }),
  {
    loginAction,
    showNotification,
  },
)
@connectRouter(({ uuid }) => ({ uuid }))
export class RegistrationPageContainer extends Component {
  static propTypes = {
    uuid: PropTypes.string,
    loginAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    extensions: PropTypes.array,
    pageProps: PropTypes.object,
  };
  static defaultProps = {
    uuid: undefined,
    extensions: [],
    pageProps: {},
  };

  state = {
    isTokenActive: false,
    email: '',
    isLoadingFinished: false,
  };

  componentDidMount() {
    this.fetchUserData();
  }

  componentDidUpdate(prevProps) {
    if (!this.state.isLoadingFinished || prevProps.uuid !== this.props.uuid) {
      this.fetchUserData();
    }
  }

  fetchUserData = () => {
    const { uuid } = this.props;
    if (!uuid) {
      return;
    }

    fetch(URLS.userRegistration(), { params: { uuid } }).then((data) =>
      this.setState({
        isTokenActive: data.isActive,
        email: data.email,
        isLoadingFinished: true,
      }),
    );
  };

  registrationHandler = ({ name, login, password, email }) => {
    const uuid = this.props.uuid;
    const data = {
      fullName: name,
      login,
      password,
      email,
    };
    return fetch(URLS.userRegistration(), { method: 'post', data, params: { uuid } })
      .then(() => this.props.loginAction({ login, password }))
      .catch(({ message }) => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message,
        });
        throw message;
      });
  };

  render() {
    const uuid = this.props.uuid;
    const {
      extensions,
      pageProps: { type },
    } = this.props;

    return (
      !uuid ||
      (this.state.isLoadingFinished &&
        (type === TYPE_SIGNUP && extensions.length !== 0 ? (
          extensions.map((extension) => (
            <ExtensionLoader
              components={{ RegistrationPage }}
              tokenProvided={Boolean(uuid)}
              tokenActive={this.state.isTokenActive}
              uuid={uuid}
              extension={extension}
              withPreloader
              silentOnError={false}
            />
          ))
        ) : (
          <RegistrationPage
            tokenProvided={Boolean(uuid)}
            tokenActive={this.state.isTokenActive}
            email={this.state.email}
            onRegistrationSubmit={this.registrationHandler}
          />
        )))
    );
  }
}
