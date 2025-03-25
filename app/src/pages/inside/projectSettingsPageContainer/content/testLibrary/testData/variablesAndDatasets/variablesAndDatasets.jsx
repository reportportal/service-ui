/*
 * Copyright 2025 EPAM Systems
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

import classNames from 'classnames/bind';
import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import { fullNameSelector } from 'controllers/user/selectors';
import { VariablesControl } from '../variablesControl';
import { Datasets } from '../datasets';

import styles from './variablesAndDatasets.scss';

const cx = classNames.bind(styles);

export const VariablesAndDatasets = () => {
  const [variables] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const username = useSelector(fullNameSelector);

  const handleDatasetAdd = (data) => {
    setDatasets((prevState) => [...prevState, { ...data, timestamp: new Date(), username }]);
  };

  return (
    <div className={cx('variables-and-datasets')}>
      <VariablesControl />
      <Datasets datasets={datasets} variables={variables} onDatasetAdd={handleDatasetAdd} />
    </div>
  );
};
