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
import Parser from 'html-react-parser';
import { PlainTableCell } from '../plainTableCell';
import { columnPropTypes } from '../propTypes';
import styles from './plainTableRow.scss';

const cx = classNames.bind(styles);

export const PlainTableRow = ({ value, columns, actions }) => (
  <div className={cx('plain-table-row-wrapper')}>
    <div className={cx('plain-table-row', 'plain-table-row-appearance')}>
      {columns.map(({ id, align, component, title, cellCustomProps }) => (
        <PlainTableCell
          key={id}
          id={id}
          value={value}
          title={title}
          component={component}
          align={align}
          cellCustomProps={cellCustomProps}
        />
      ))}
    </div>
    {actions.map(({ id, handler, icon }) => (
      <i className={cx('plain-table-row-icon')} key={id} onClick={() => handler(value)}>
        {Parser(icon)}
      </i>
    ))}
  </div>
);
PlainTableRow.propTypes = {
  value: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape(columnPropTypes)).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      handler: PropTypes.func,
      id: PropTypes.number,
    }),
  ),
};
PlainTableRow.defaultProps = {
  actions: [],
};
