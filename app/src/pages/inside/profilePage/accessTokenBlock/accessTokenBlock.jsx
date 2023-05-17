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

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { apiKeysSelector } from 'controllers/user';
import { NoApiKeysBlock } from 'pages/inside/profilePage/accessTokenBlock/noApiKeysBlock';
import { ApiKeysBlock } from 'pages/inside/profilePage/accessTokenBlock/apiKeysBlock';
import styles from './accessTokenBlock.scss';

const cx = classNames.bind(styles);

const AccessTokenBlockBase = ({ apiKeys }) => (
  <div className={cx('access-token-block')}>
    {apiKeys.length && apiKeys.length !== 0 ? (
      <ApiKeysBlock apiKeys={apiKeys} />
    ) : (
      <NoApiKeysBlock />
    )}
  </div>
);
AccessTokenBlockBase.propTypes = {
  showModalAction: PropTypes.func.isRequired,
  apiKeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      hash: PropTypes.string,
      created_at: PropTypes.number,
    }),
  ),
};
export const AccessTokenBlock = connect(
  (state) => ({
    apiKeys: apiKeysSelector(state),
  }),
  {
    showModalAction,
  },
)(AccessTokenBlockBase);
