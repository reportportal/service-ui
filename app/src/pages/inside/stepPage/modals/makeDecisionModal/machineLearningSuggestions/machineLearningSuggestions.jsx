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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import Parser from 'html-react-parser';
import ExternalLinkIcon from 'common/img/go-to-another-page-inline.svg';
import { MACHINE_LEARNING_SUGGESTIONS } from '../constants';
import { TestItemDetails } from '../elements/testItemDetails';
import styles from './machineLearningSuggestions.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const MachineLearningSuggestions = ({
  modalState,
  itemData,
  eventsInfo,
  isAnalyzerAvailable,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const item = modalState.suggestChoice;
  const { logs, suggestRs } = item;

  const defectFromTIGroup =
    itemData.issue && itemData.issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

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

  return (
    <>
      <TestItemDetails
        item={item}
        onClickLinkEvent={onClickExternalLinkEvent}
        logs={logs}
        highlightedLogId={suggestRs.relevantLogId}
        highlightedMessage={formatMessage(messages.similarLog)}
        eventsInfo={{
          onOpenStackTraceEvent: () => eventsInfo.onOpenStackTrace(defectFromTIGroup, true),
        }}
      />
    </>
  );
};

MachineLearningSuggestions.propTypes = {
  modalState: PropTypes.object.isRequired,
  setModalState: PropTypes.func.isRequired,
  itemData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
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
