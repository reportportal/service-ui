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
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { IssueList } from 'pages/inside/stepPage/stepGrid/defectType/issueList';
import { UNLINK_ISSUE } from 'common/constants/actionTypes';
import { ResultRow } from './resultRow';
import { CommentSection } from './commentSection';
import { ACTIVE_TAB_MAP, SELECT_DEFECT_MANUALLY } from '../../constants';
import { messages } from '../../messages';
import styles from './infoBlock.scss';

const cx = classNames.bind(styles);

export const InfoBlock = ({
  modalState,
  setModalState,
  isBulkOperation,
  expanded,
  onToggle,
  eventsInfo,
}) => {
  const { formatMessage } = useIntl();
  const { decisionType, issueActionType } = modalState;
  const currentSource = modalState[ACTIVE_TAB_MAP[decisionType]].issue;

  const testItemsLength = isBulkOperation
    ? modalState.currentTestItems.length
    : modalState.selectedItems.length + modalState.currentTestItems.length;
  const defectTypeChanged =
    currentSource.issueType &&
    modalState.currentTestItems.some((item) => item.issue.issueType !== currentSource.issueType);
  const externalIssue =
    (modalState.decisionType !== SELECT_DEFECT_MANUALLY &&
      !!currentSource.externalSystemIssues.length &&
      currentSource.externalSystemIssues) ||
    [];
  const ignoreInAAChanged =
    !isBulkOperation &&
    currentSource.ignoreAnalyzer !== modalState.currentTestItems[0].issue.ignoreAnalyzer;
  const getTitle = () => {
    if (expanded) {
      return formatMessage(messages.followingResult, {
        items: (
          <span className={cx('bold')} key={0}>
            {testItemsLength > 1
              ? formatMessage(messages.itemsCount, { count: testItemsLength })
              : formatMessage(messages.item)}
          </span>
        ),
      });
    } else {
      return testItemsLength > 1
        ? formatMessage(messages.applyToItems, { itemsCount: testItemsLength })
        : formatMessage(messages.applyToItem);
    }
  };

  return (
    <div className={cx('container', { expanded })}>
      <div className={cx('header', { expanded })} onClick={onToggle}>
        <span className={cx('arrow', { expanded })} />
        {getTitle()}
      </div>
      {expanded && (
        <div className={cx('result-container')}>
          {defectTypeChanged && (
            <ResultRow text={formatMessage(messages.defectReplaceWith)}>
              <DefectTypeItem type={currentSource.issueType} className={cx('defect-type')} />
              {ignoreInAAChanged &&
                decisionType === SELECT_DEFECT_MANUALLY &&
                `${formatMessage(messages.and)} ${formatMessage(
                  currentSource.ignoreAnalyzer
                    ? messages.defectIgnoreInAa
                    : messages.defectIncludeInAa,
                )}`}
            </ResultRow>
          )}
          {!defectTypeChanged && ignoreInAAChanged && (
            <ResultRow
              text={formatMessage(
                currentSource.ignoreAnalyzer
                  ? messages.defectIgnoreInAa
                  : messages.defectIncludeInAa,
              ).replace(/^./, (str) => str.toUpperCase())}
            />
          )}
          {!!externalIssue.length && (
            <ResultRow text={formatMessage(messages.linkReplacedWith)}>
              <IssueList issues={externalIssue} className={cx('issue')} readOnly />
            </ResultRow>
          )}
          {issueActionType && (
            <ResultRow
              text={formatMessage(
                issueActionType === UNLINK_ISSUE
                  ? messages.linkRemovedOnNextStep
                  : messages.linkAddedOnNextStep,
              )}
            />
          )}
          <CommentSection
            modalState={modalState}
            setModalState={setModalState}
            isBulkOperation={isBulkOperation}
            eventsInfo={eventsInfo}
          />
        </div>
      )}
    </div>
  );
};
InfoBlock.propTypes = {
  modalState: PropTypes.object,
  setModalState: PropTypes.func,
  isBulkOperation: PropTypes.bool,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  eventsInfo: PropTypes.object,
};
InfoBlock.defaultProps = {
  modalState: {},
  setModalState: () => {},
  isBulkOperation: false,
  expanded: false,
  onToggle: () => {},
  eventsInfo: {},
};
