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
import styles from './plainTableCell.scss';
import { columnPropTypes } from '../propTypes';
import { ALIGN_LEFT } from '../constants';
import { TextCell } from '../textCell';

const cx = classNames.bind(styles);

export const PlainTableCell = ({ value, id, component, title, align, cellCustomProps }) => {
  const CellComponent = component;

  return (
    <CellComponent
      className={cx('table-cell', { [`align-${align}`]: align })}
      title={title}
      id={id}
      cellCustomProps={cellCustomProps}
      value={value}
    />
  );
};
PlainTableCell.propTypes = { ...columnPropTypes, value: PropTypes.object.isRequired };
PlainTableCell.defaultProps = {
  component: TextCell,
  align: ALIGN_LEFT,
  title: {},
};
