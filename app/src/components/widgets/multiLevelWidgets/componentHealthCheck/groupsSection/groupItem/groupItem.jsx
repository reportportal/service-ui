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
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import { messages } from 'components/widgets/common/messages';
import AnotherPageIcon from 'common/img/go-to-another-page-inline.svg';
import { groupItemPropTypes } from '../propTypes';
import styles from './groupItem.scss';

const cx = classNames.bind(styles);

export const GroupItem = ({
  formatMessage,
  attributeValue,
  passingRate,
  total,
  color,
  onClickGroupItem,
  getSpecificTestListLink,
  isClickable,
}) => (
  <div
    className={cx('group-item', { 'group-item-clickable': isClickable })}
    style={{ borderTopColor: color }}
    onClick={isClickable ? () => onClickGroupItem(attributeValue, passingRate, color) : undefined}
  >
    <h4 className={cx('item-title')} title={attributeValue}>
      {attributeValue}
    </h4>
    <div className={cx('stat-wrapper')}>
      <div className={cx('stat-item')}>
        <span className={cx('stat-item-header')}>{formatMessage(messages.passingRate)}</span>
        <span className={cx('stat-item-value')}>{`${passingRate} %`}</span>
      </div>
      <div className={cx('stat-item')}>
        <span className={cx('stat-item-header')}>{formatMessage(messages.testCasesCaption)}</span>
        <span className={cx('stat-item-value')}>{total}</span>
      </div>
    </div>
    <Link
      className={cx('icon')}
      to={getSpecificTestListLink(attributeValue)}
      onClick={(event) => event.stopPropagation()}
      target="_blank"
    >
      {Parser(AnotherPageIcon)}
    </Link>
  </div>
);
GroupItem.propTypes = {
  ...groupItemPropTypes,
  color: PropTypes.string,
  formatMessage: PropTypes.func,
};
GroupItem.defaultProps = {
  attributeValue: '',
  passingRate: 0,
  total: 0,
  color: '',
  formatMessage: () => {},
};
