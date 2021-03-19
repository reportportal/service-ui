/*
 * Copyright 2021 EPAM Systems
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
import { defectTypesSelector } from 'controllers/project';
import { useSelector } from 'react-redux';
import styles from './executionInfo.scss';
import { ItemHeader } from '../itemHeader';
import { HistoryLineItemContent } from '../../historyLine/historyLineItem';

const cx = classNames.bind(styles);

export const ExecutionInfo = ({ className, item, selectItem, selectedItem }) => {
  const defectTypes = useSelector(defectTypesSelector);

  return (
    <div className={cx('execution-info-container', className)}>
      <div className={cx('history-line-item')}>
        <HistoryLineItemContent defectTypes={defectTypes} showTriangles={false} {...item} />
      </div>
      <ItemHeader item={item} selectItem={selectItem} isSelected={selectedItem === item.id} />
    </div>
  );
};
ExecutionInfo.propTypes = {
  defectTypes: PropTypes.object.isRequired,
  className: PropTypes.string,
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  selectItem: PropTypes.func,
  selectedItem: PropTypes.number,
};

ExecutionInfo.defaultProps = {
  defectTypes: {},
  className: '',
  item: {},
  isSelected: false,
  selectedItem: null,
  selectItem: () => {},
};
