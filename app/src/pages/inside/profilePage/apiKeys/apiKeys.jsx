/*
 * Copyright 2023 EPAM Systems
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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { apiKeysSelector, fetchApiKeysAction } from 'controllers/user';
import { NoApiKeysBlock } from 'pages/inside/profilePage/apiKeys/noApiKeysBlock';
import { ApiKeysBlock } from 'pages/inside/profilePage/apiKeys/apiKeysBlock';
import styles from './apiKeys.scss';

const cx = classNames.bind(styles);

const ApiKeysBase = ({ apiKeys }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchApiKeysAction());
  }, []);

  return (
    <div className={cx('api-keys')}>
      {apiKeys.length ? <ApiKeysBlock apiKeys={apiKeys} /> : <NoApiKeysBlock />}
    </div>
  );
};
ApiKeysBase.propTypes = {
  apiKeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      created_at: PropTypes.number,
    }),
  ).isRequired,
};
export const ApiKeys = connect((state) => ({
  apiKeys: apiKeysSelector(state),
}))(ApiKeysBase);
