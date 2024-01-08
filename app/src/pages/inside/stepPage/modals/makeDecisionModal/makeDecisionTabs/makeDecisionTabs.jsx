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
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import Parser from 'html-react-parser';
import ExternalLinkIcon from 'common/img/go-to-another-page-inline.svg';
import {
  COPY_FROM_HISTORY_LINE,
  MACHINE_LEARNING_SUGGESTIONS,
  SELECT_DEFECT_MANUALLY,
} from '../constants';
import { messages } from '../messages';
import styles from './makeDecisionTabs.scss';

const cx = classNames.bind(styles);

export const MakeDecisionTabs = ({
  tabs,
  toggleTab,
  suggestedItems,
  loadingMLSuggest,
  modalState,
  setModalState,
  isAnalyzerAvailable,
  isMLSuggestionsAvailable,
}) => {
  const { formatMessage } = useIntl();
  const [selectedMLSuggest, setSelectedMLSuggest] = useState(null);
  const [animationSuggest, setAnimationSuggest] = useState(true);
  const [selectDefectTab, machineLearningTab, copyFromHistoryLineTab] = tabs;
  const source = modalState.suggestChoice;

  const selectMachineLearningSuggestionItem = (index, itemId) => {
    if (itemId && itemId === source.id && machineLearningTab.isOpen) {
      return;
    }
    toggleTab(MACHINE_LEARNING_SUGGESTIONS);
    setSelectedMLSuggest(index);

    if (index === 0) {
      setAnimationSuggest(false);
    }

    const { testItemResource, logs, suggestRs } = suggestedItems.find(
      (item) => item.testItemResource.id === itemId,
    );
    setModalState({
      ...modalState,
      decisionType: MACHINE_LEARNING_SUGGESTIONS,
      issueActionType: '',
      suggestChoice: { ...testItemResource, logs, suggestRs },
    });
  };

  const selectSideTab = (tab) => {
    toggleTab(tab);

    setModalState({
      ...modalState,
      decisionType: tab,
    });
  };

  const renderActiveTab = () => {
    const tab = tabs.find((el) => el.isOpen);
    return (
      <div className={cx({ tab: isMLSuggestionsAvailable })}>
        {isMLSuggestionsAvailable && <div className={cx('tab-header')}>{tab.title}</div>}
        <div
          className={cx('tab-content', {
            'padding-right-20': tab.id === COPY_FROM_HISTORY_LINE,
          })}
        >
          {tab.content}
        </div>
      </div>
    );
  };

  return (
    <div className={cx('make-decision-tabs')}>
      {isMLSuggestionsAvailable && (
        <div className={cx('tabs')}>
          <div
            onClick={() => selectSideTab(SELECT_DEFECT_MANUALLY)}
            className={cx('side-block', {
              'side-block-active': selectDefectTab.isOpen,
            })}
          >
            <p className={cx('side-block-title')}>{formatMessage(messages.manual)}</p>
            <p className={cx('side-block-text')}>{formatMessage(messages.selection)}</p>
          </div>
          <div className={cx('central-block')}>
            {loadingMLSuggest && (
              <div className={cx('central-block-default')}>
                <div className={cx('preloader')}>
                  <BubblesPreloader />
                </div>
                <p className={cx('suggest-text')}>{formatMessage(messages.analyzingSuggestions)}</p>
              </div>
            )}
            {!isAnalyzerAvailable && !loadingMLSuggest && (
              <div className={cx('central-block-default')}>
                <div className={cx('no-suggestion-prompt')}>
                  <div className={cx('padding-right-20')}>
                    {formatMessage(messages.analyzerUnavailable)}
                  </div>
                  <div className={cx('link-wrapper')}>
                    {formatMessage(messages.pleaseCheck)}
                    <a
                      href="https://reportportal.io/docs/issues-troubleshooting/ResolveAnalyzerKnownIssues/"
                      target="_blank"
                      className={cx('suggestion-link')}
                    >
                      <span>{formatMessage(messages.analyzerUnavailableLink)}</span>
                      <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
                    </a>
                  </div>
                </div>
              </div>
            )}
            {suggestedItems.length === 0 && !loadingMLSuggest && isAnalyzerAvailable && (
              <div className={cx('central-block-default')}>
                <div className={cx('no-suggestion-prompt')}>
                  {formatMessage(messages.noSuggestions)}
                </div>
              </div>
            )}

            {isAnalyzerAvailable &&
              suggestedItems.map(({ suggestRs, testItemResource }, index) => (
                <div
                  key={testItemResource.id}
                  onClick={() => selectMachineLearningSuggestionItem(index, testItemResource.id)}
                  className={cx(`suggest-item`, {
                    [`suggest-item-active`]:
                      machineLearningTab.isOpen && selectedMLSuggest === index,
                    jumping: index === 0 && suggestedItems.length && animationSuggest,
                  })}
                >
                  <p className={cx('suggest-title')}>{suggestRs.matchScore}%</p>
                  <p className={cx('suggest-text')}>{formatMessage(messages.analyzerSuggestion)}</p>
                </div>
              ))}
          </div>
          {copyFromHistoryLineTab && (
            <div
              onClick={() => selectSideTab(COPY_FROM_HISTORY_LINE)}
              className={cx('side-block', {
                'side-block-active': copyFromHistoryLineTab.isOpen,
              })}
            >
              <p className={cx('side-block-title')}>{formatMessage(messages.history)}</p>
              <p className={cx('side-block-text')}>{formatMessage(messages.ofTheTest)}</p>
            </div>
          )}
        </div>
      )}
      {renderActiveTab()}
    </div>
  );
};

MakeDecisionTabs.propTypes = {
  modalState: PropTypes.object.isRequired,
  setModalState: PropTypes.func.isRequired,
  tabs: PropTypes.array,
  toggleTab: PropTypes.func,
  suggestedItems: PropTypes.array,
  loadingMLSuggest: PropTypes.bool,
  isAnalyzerAvailable: PropTypes.bool,
  isMLSuggestionsAvailable: PropTypes.bool,
};
MakeDecisionTabs.defaultProps = {
  tabs: [],
  toggleTab: () => {},
  suggestedItems: [],
  loadingMLSuggest: false,
  isAnalyzerAvailable: false,
  isMLSuggestionsAvailable: false,
};
