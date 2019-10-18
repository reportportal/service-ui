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

import * as React from 'react';
import { arrayOf, bool, string, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { PTStatus } from '../../pTypes';
import styles from './matrixFactory.scss';

const cx = classNames.bind(styles);

const renderForBool = (id) => (failed, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', { 'most-failed': failed })} />
);

const renderForString = (id) => (status, idx) => (
  <div key={`${id}-square-${idx}`} className={cx('square', status.toLowerCase())} />
);

export function matrixFactory(renderBool) {
  const renderFn = renderBool ? renderForBool : renderForString;

  const Matrix = ({ tests, id }) => (
    <div className={cx('matrix')}>
      <div className={cx('squares-wrapper')}>{tests.map(renderFn(id))}</div>
    </div>
  );

  Matrix.propTypes = {
    tests: arrayOf(oneOfType([bool, PTStatus])).isRequired,
    id: string.isRequired,
  };

  return Matrix;
}
