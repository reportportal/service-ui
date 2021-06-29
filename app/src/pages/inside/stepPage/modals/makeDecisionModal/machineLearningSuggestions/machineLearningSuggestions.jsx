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
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import styles from './machineLearningSuggestions.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const MachineLearningSuggestions = ({
  modalState,
  setModalState,
  itemData,
  collapseTabsExceptCurr,
  loadingMLSuggest,
}) => {
  const [showErrorLogs, setShowErrorLogs] = useState(false);

  const { formatMessage } = useIntl();

  const { suggestedItems } = modalState;

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
      const { testItemResource } = suggestedItems.find(
        (item) => item.testItemResource.id === itemId,
      );
      setModalState({
        ...modalState,
        source: testItemResource,
        decisionType: MACHINE_LEARNING_SUGGESTIONS,
        issueActionType: '',
      });
      collapseTabsExceptCurr(MACHINE_LEARNING_SUGGESTIONS);
    } else {
      setModalState({ ...modalState, source: { issue: itemData.issue }, decisionType: '' });
    }
  };

  return loadingMLSuggest ? (
    <SpinningPreloader />
  ) : (
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

      {suggestedItems.map(
        ({ suggestRs, logs, testItemResource }) =>
          suggestRs.matchScore >= 40 && (
            <div key={testItemResource.id} className={cx('suggestion-item')}>
              <div className={cx('suggestion-info')}>
                <span className={cx('suggestion-info-number')}>{suggestRs.matchScore}</span>
                <span
                  className={cx('suggestion-info-status', {
                    'color-low': suggestRs.matchScore < 70,
                  })}
                >
                  {getInfoStatus(suggestRs.matchScore)}
                </span>
              </div>
              <div className={cx('suggestion-item-wrapper')} key={testItemResource.id}>
                <ItemHeader
                  item={testItemResource}
                  selectItem={selectMachineLearningSuggestionItem}
                  isSelected={modalState.source.id === testItemResource.id}
                />
                {showErrorLogs &&
                  logs.slice(0, ERROR_LOGS_SIZE).map((log) => (
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
  modalState: PropTypes.object.isRequired,
  setModalState: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  collapseTabsExceptCurr: PropTypes.func.isRequired,
  loadingMLSuggest: PropTypes.bool,
};
MachineLearningSuggestions.defaultProps = {
  items: [],
  itemData: {},
  loadingMLSuggest: false,
};
