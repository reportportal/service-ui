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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { columnPropTypes } from '../propTypes';
import styles from './plainTableHeader.scss';
import { TextCell } from '../textCell';

const cx = classNames.bind(styles);

export function PlainTableHeader({ columns, hasActions }) {
  return (
    <div className={cx('header', { 'header-additional-offset': hasActions })}>
      {columns.map(({ id, title: { component = TextCell, align, full, ...rest } }) => {
        const HeaderComponent = component;

        return (
          <HeaderComponent
            className={cx('text', {
              [`align-${align}`]: align,
            })}
            value={full}
            key={id}
            {...rest}
          />
        );
      })}
    </div>
  );
}
PlainTableHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)).isRequired,
  hasActions: PropTypes.bool,
};
PlainTableHeader.defaultProps = {
  hasActions: false,
};
