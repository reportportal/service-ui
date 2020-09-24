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
import Link from 'redux-first-router-link';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { LOGIN_PAGE } from 'controllers/pages';
import { BigButton } from 'components/buttons/bigButton';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { normalizePathWithPrefix, setWindowLocationToNewPath } from 'pages/outside/common/utils';
import styles from './externalLoginBlock.scss';

const cx = classNames.bind(styles);

export class ExternalLoginBlock extends PureComponent {
  static propTypes = {
    externalAuth: PropTypes.object,
  };
  static defaultProps = {
    externalAuth: {},
  };

  state = {
    authInProgress: false,
  };

  getExternalAuthClickHandler = (path) => () => {
    this.setState({ authInProgress: true });
    setWindowLocationToNewPath(normalizePathWithPrefix(path));
  };

  renderButtons = () => {
    const { externalAuth } = this.props;
    return Object.keys(externalAuth).map((authType) => {
      const val = externalAuth[authType];

      return (
        <div className={cx('external-auth-btn')} key={authType}>
          <BigButton roundedCorners color="booger">
            {val.providers ? (
              <Link to={{ type: LOGIN_PAGE, payload: { query: { multipleAuth: authType } } }}>
                {Parser(val.button)}
              </Link>
            ) : (
              <span onClick={this.getExternalAuthClickHandler(val.path)}>{Parser(val.button)}</span>
            )}
          </BigButton>
        </div>
      );
    });
  };

  render() {
    return (
      <div className={cx('external-login-block')}>
        {this.state.authInProgress ? <SpinningPreloader /> : this.renderButtons()}
      </div>
    );
  }
}
