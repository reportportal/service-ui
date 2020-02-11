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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './historyCell.scss';

const cx = classNames.bind(styles);

export const HistoryCell = ({ status, header, children, onClick, first, bottom, highlighted }) => {
  const prefix = header ? 'header' : 'body';
  const className = cx('table-cell', `table-${prefix}-cell`, {
    [`table-${prefix}-cell-${status}`]: status,
    [`table-${prefix}-cell-first`]: first,
    [`table-${prefix}-cell-bottom`]: bottom,
    highlighted,
  });
  return header ? (
    <th className={className} onClick={onClick}>
      {children}
    </th>
  ) : (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <td className={className} onClick={onClick}>
      {children}
    </td>
  );
};

HistoryCell.propTypes = {
  status: PropTypes.string,
  header: PropTypes.bool,
  first: PropTypes.bool,
  bottom: PropTypes.bool,
  highlighted: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onClick: PropTypes.func,
};

HistoryCell.defaultProps = {
  status: null,
  header: false,
  first: false,
  bottom: false,
  highlighted: false,
  children: null,
  onClick: () => {},
};
