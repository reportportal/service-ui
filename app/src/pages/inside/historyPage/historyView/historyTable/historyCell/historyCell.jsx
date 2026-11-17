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
import { NOT_FOUND, RESETED } from 'common/constants/testStatuses';
import { CELL_PREVIEW_ATTRIBUTE } from '../../constants';
import { getAttributeValue, getAttributeCellColor } from '../../utils';
import styles from './historyCell.scss';

const cx = classNames.bind(styles);

export const HistoryCell = ({
  status,
  header,
  children,
  onClick,
  first,
  bottom,
  highlighted,
  cellPreview,
  attributeKey,
  highlightLessThan,
  testItem,
}) => {
  const prefix = header ? 'header' : 'body';
  const className = cx('table-cell', `table-${prefix}-cell`, {
    [`table-${prefix}-cell-${status}`]: status,
    [`table-${prefix}-cell-first`]: first,
    [`table-${prefix}-cell-bottom`]: bottom,
    highlighted,
  });

  // Calculate attribute-based background color
  let attributeStyle = {};
  const isEmptyCell = status === NOT_FOUND || status === RESETED;
  const shouldApplyAttributeColor =
    !header &&
    cellPreview === CELL_PREVIEW_ATTRIBUTE &&
    attributeKey &&
    highlightLessThan &&
    !isEmptyCell;

  if (shouldApplyAttributeColor) {
    const value = getAttributeValue(testItem?.attributes, attributeKey);
    const backgroundColor = getAttributeCellColor(value, highlightLessThan);
    if (backgroundColor) {
      attributeStyle = { backgroundColor };
    }
  }

  return header ? (
    <th className={className} onClick={onClick}>
      {children}
    </th>
  ) : (
    <td className={className} onClick={onClick} style={attributeStyle}>
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
  cellPreview: PropTypes.string,
  attributeKey: PropTypes.string,
  highlightLessThan: PropTypes.string,
  testItem: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onClick: PropTypes.func,
};

HistoryCell.defaultProps = {
  status: null,
  header: false,
  first: false,
  bottom: false,
  highlighted: false,
  cellPreview: '',
  attributeKey: '',
  highlightLessThan: '',
  testItem: null,
  children: null,
  onClick: () => {},
};
