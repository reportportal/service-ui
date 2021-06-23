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

import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { InputSwitcher } from 'components/inputs/inputSwitcher';
import { ItemHeader } from 'pages/inside/stepPage/modals/makeDecisionModal/elements/itemHeader';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import {
  ERROR_LOGS_SIZE,
  MACHINE_LEARNING_SUGGESTIONS,
} from 'pages/inside/stepPage/modals/makeDecisionModal/constants';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import styles from './machineLearningSuggestions.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const MachineLearningSuggestions = ({
  items,
  modalState,
  setModalState,
  itemData,
  collapseTabsExceptCurr,
}) => {
  const [showErrorLogs, setShowErrorLogs] = useState(false);

  const { formatMessage } = useIntl();
  const getInfoStatus = (score) => {
    if (score === 100) {
      return 'SAME';
    } else if (score < 100 && score >= 70) {
      return 'HIGH';
    } else {
      return 'LOW';
    }
  };

  const selectMachineLearningSuggestionItem = (itemId) => {
    if (itemId && itemId !== modalState.source.id) {
      const suggestionItem = items.find((item) => item.id === itemId);
      setModalState({
        ...modalState,
        source: suggestionItem,
        decisionType: MACHINE_LEARNING_SUGGESTIONS,
        issueActionType: '',
      });
      collapseTabsExceptCurr(MACHINE_LEARNING_SUGGESTIONS);
    } else {
      setModalState({ ...modalState, source: { issue: itemData.issue }, decisionType: '' });
    }
  };

  return (
    <>
      <div className={cx('suggestion-header')}>
        <div className={cx('suggestion-header-text')}>
          <span>{`${formatMessage(messages.similarity)} %`}</span>
          <span>{formatMessage(messages.suggestedTest)}</span>
        </div>
        <InputSwitcher
          value={showErrorLogs}
          onChange={setShowErrorLogs}
          className={cx('show-error-logs')}
          childrenFirst
          childrenClassName={cx('input-switcher-children')}
          size="medium"
          mode="dark"
        >
          <span>{formatMessage(messages.showErrorLogs)}</span>
        </InputSwitcher>
      </div>

      {items.map(
        (item) =>
          item.score >= 40 && (
            <div key={item.id} className={cx('suggestion-item')}>
              <div className={cx('suggestion-info')}>
                <span className={cx('suggestion-info-number')}>{item.score}</span>
                <span className={cx('suggestion-info-status', { 'color-low': item.score < 70 })}>
                  {getInfoStatus(item.score)}
                </span>
              </div>
              <div className={cx('suggestion-item-wrapper')} key={item.id || item.itemId}>
                <ItemHeader
                  item={item}
                  selectItem={selectMachineLearningSuggestionItem}
                  isSelected={modalState.source.id === item.id}
                  selectedItem={modalState.source.id}
                />
                {showErrorLogs &&
                  item.logs.slice(0, ERROR_LOGS_SIZE).map((log) => (
                    <div key={log.id} className={cx('error-log')}>
                      <StackTraceMessageBlock level={log.level} designMode="dark" maxHeight={70}>
                        <div>{log.message}</div>
                      </StackTraceMessageBlock>
                    </div>
                  ))}
              </div>
            </div>
          ),
      )}
    </>
  );
};

MachineLearningSuggestions.propTypes = {
  items: PropTypes.array,
  modalState: PropTypes.object.isRequired,
  setModalState: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  collapseTabsExceptCurr: PropTypes.func.isRequired,
};
MachineLearningSuggestions.defaultProps = {
  items: [],
  itemData: {},
};
