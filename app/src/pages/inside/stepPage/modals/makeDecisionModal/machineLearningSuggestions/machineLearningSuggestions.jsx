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
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import Parser from 'html-react-parser';
import ExternalLinkIcon from 'common/img/go-to-another-page-inline.svg';
import { HIGH, LOW, MACHINE_LEARNING_SUGGESTIONS, SAME } from '../constants';
import { TestItemDetails } from '../elements/testItemDetails';
import styles from './machineLearningSuggestions.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const MachineLearningSuggestions = ({
  modalState,
  setModalState,
  itemData,
  collapseTabsExceptCurr,
  loadingMLSuggest,
  eventsInfo,
  isAnalyzerAvailable,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [showErrorLogs, setShowErrorLogs] = useState(false);

  const { suggestedItems } = modalState;
  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  const getInfoStatus = (score) => {
    if (score === SAME) {
      return 'SAME';
    } else if (score < SAME && score >= HIGH) {
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

  const onChange = (value) => {
    setShowErrorLogs(value);
    const { toggleShowErrLogsSwitcher } = eventsInfo;
    trackEvent(
      toggleShowErrLogsSwitcher({ isTIGroup: defectFromTIGroup, state: value, isMlSection: true }),
    );
  };

  const onClickExternalLinkEvent = () => {
    const { onClickExternalLink } = eventsInfo;
    const args = {
      isTIGroup: defectFromTIGroup,
      section: messages[MACHINE_LEARNING_SUGGESTIONS].defaultMessage,
    };
    trackEvent(onClickExternalLink(args));
  };

  if (!isAnalyzerAvailable) {
    return (
      <div className={cx('no-suggestion-prompt')}>
        {formatMessage(messages.analyzerUnavailable)}
        <a
          href={'https://reportportal.io/docs/Deploy-Elastic-Search'}
          target="_blank"
          className={cx('suggestion-link')}
        >
          <span>{formatMessage(messages.analyzerUnavailableLink)}</span>
          <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
        </a>
      </div>
    );
  }

  if (suggestedItems.length === 0 && !loadingMLSuggest) {
    return (
      <div className={cx('no-suggestion-prompt')}>
        {formatMessage(messages.suggestionsNotFound)}
      </div>
    );
  }

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
          onChange={onChange}
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
          suggestRs.matchScore >= LOW && (
            <div key={testItemResource.id} className={cx('suggestion-item')}>
              <div className={cx('suggestion-info')}>
                <span className={cx('suggestion-info-number')}>{suggestRs.matchScore}</span>
                <span
                  className={cx('suggestion-info-status', {
                    'color-low': suggestRs.matchScore < HIGH,
                  })}
                >
                  {getInfoStatus(suggestRs.matchScore)}
                </span>
              </div>
              <div className={cx('suggestion-item-wrapper')} key={testItemResource.id}>
                <TestItemDetails
                  item={testItemResource}
                  selectItem={selectMachineLearningSuggestionItem}
                  isSelected={modalState.source.id === testItemResource.id}
                  onClickLinkEvent={onClickExternalLinkEvent}
                  logs={logs}
                  highlightedLogId={suggestRs.relevantLogId}
                  highlightedMessage={formatMessage(messages.similarLog)}
                  eventsInfo={{
                    onOpenStackTraceEvent: () =>
                      eventsInfo.onOpenStackTrace(defectFromTIGroup, true),
                  }}
                />
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
  itemData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  collapseTabsExceptCurr: PropTypes.func.isRequired,
  loadingMLSuggest: PropTypes.bool,
  eventsInfo: PropTypes.object,
  isAnalyzerAvailable: PropTypes.bool,
};
MachineLearningSuggestions.defaultProps = {
  items: [],
  itemData: {},
  loadingMLSuggest: false,
  eventsInfo: {},
  isAnalyzerAvailable: false,
};
