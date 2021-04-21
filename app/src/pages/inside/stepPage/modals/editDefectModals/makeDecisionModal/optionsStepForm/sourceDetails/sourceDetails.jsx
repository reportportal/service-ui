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
import { useSelector } from 'react-redux';
import { ExecutionInfo } from 'pages/inside/logsPage/defectEditor/executionInfo';
import { DefectTypeItemML } from 'pages/inside/common/defectTypeItemML';
import { messages } from 'pages/inside/stepPage/modals/editDefectModals/messages';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CommentIcon from 'common/img/comment-inline.svg';
import BugIcon from 'common/img/bug-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { MarkdownViewer } from 'components/main/markdown';
import { defectTypesSelector } from 'controllers/project';
import { LINK_ISSUE, POST_ISSUE, UNLINK_ISSUE } from 'common/constants/actionTypes';
import styles from './sourceDetails.scss';

const cx = classNames.bind(styles);

export const SourceDetails = ({ info, issueActionType }) => {
  const { formatMessage } = useIntl();
  const defectTypes = Object.values(useSelector(defectTypesSelector)).flat();
  const defectType = defectTypes.filter((type) => type.locator === info.issue.issueType)[0];
  const renderCommentBlock = () => {
    return (
      <div className={cx('comment-block')}>
        <span className={cx('icon')}>{Parser(CommentIcon)}</span>
        <ScrollWrapper autoHeight hideTracksWhenNotNeeded autoHeightMax={80}>
          <MarkdownViewer value={info.issue.comment} mode="dark" />
        </ScrollWrapper>
      </div>
    );
  };

  const renderIssueActionBlock = () => {
    return (
      <div className={cx('issue-action-block')}>
        <span className={cx('icon')}>{Parser(BugIcon)}</span>
        <p>
          {(issueActionType === POST_ISSUE && formatMessage(messages.postIssueNote)) ||
            (issueActionType === LINK_ISSUE && formatMessage(messages.linkIssueNote)) ||
            (issueActionType === UNLINK_ISSUE && formatMessage(messages.unlinkIssueNote))}
        </p>
      </div>
    );
  };

  return (
    <>
      {info.id ? (
        <div className={cx('execution-info-content')}>
          <ExecutionInfo item={info} />
          {info.issue.comment && renderCommentBlock()}
          {issueActionType && renderIssueActionBlock()}
        </div>
      ) : (
        <div className={cx('defect-type-content')}>
          <DefectTypeItemML className={cx('source-details-defect-type')} defectType={defectType} />
          <div className={cx('defect-type-description')}>
            {info.issue.comment && renderCommentBlock()}
            {issueActionType && renderIssueActionBlock()}
            <div className={cx('analysis-block')}>
              <span className={cx('analysis-icon')}>AA</span>
              <p>
                {info.issue.ignoreAnalyzer
                  ? formatMessage(messages.excludedFromAa)
                  : formatMessage(messages.includedToAa)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
SourceDetails.propTypes = {
  info: PropTypes.object,
  issueActionType: PropTypes.string,
};
SourceDetails.defaultProps = {
  info: {},
  issueActionType: '',
};
