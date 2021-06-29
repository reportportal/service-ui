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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { SCREEN_SM_MAX, SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { ExecutionInfo } from '../elements/executionInfo';
import { COPY_FROM_HISTORY_LINE } from '../constants';
import { messages } from '../messages';
import styles from './copyFromHistoryLine.scss';

const cx = classNames.bind(styles);

export const CopyFromHistoryLine = ({
  items,
  modalState,
  itemData,
  setModalState,
  collapseTabsExceptCurr,
  windowSize,
}) => {
  const { formatMessage } = useIntl();

  const selectHistoryLineItem = (itemId) => {
    if (itemId && itemId !== modalState.source.id) {
      const historyItem = items.find((item) => item.id === itemId);
      setModalState({
        ...modalState,
        source: historyItem,
        decisionType: COPY_FROM_HISTORY_LINE,
        issueActionType: '',
      });
      collapseTabsExceptCurr(COPY_FROM_HISTORY_LINE);
    } else {
      setModalState({ ...modalState, source: { issue: itemData.issue }, decisionType: '' });
    }
  };
  const hideLabels = () => {
    if (!windowSize) return false;
    const { width } = windowSize;
    return width < SCREEN_SM_MAX && width > SCREEN_XS_MAX;
  };

  return (
    <>
      <div className={cx('execution-header')}>
        <span>{`${formatMessage(messages.execution)} #`}</span>
        <span>{formatMessage(messages.defectType)}</span>
      </div>
      {items.map((item) => (
        <div className={cx('execution-item')} key={item.id}>
          <ExecutionInfo
            item={item}
            selectedItem={modalState.source.id}
            selectItem={selectHistoryLineItem}
            isSelected={modalState.source.id === item.id}
            hideLabels={hideLabels()}
          />
        </div>
      ))}
    </>
  );
};
CopyFromHistoryLine.propTypes = {
  items: PropTypes.array,
  modalState: PropTypes.object.isRequired,
  itemData: PropTypes.object,
  setModalState: PropTypes.func.isRequired,
  collapseTabsExceptCurr: PropTypes.func.isRequired,
  windowSize: PropTypes.object,
};
CopyFromHistoryLine.defaultProps = {
  items: [],
  windowSize: {},
};
