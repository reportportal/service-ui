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

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { useOnClickOutside } from 'common/hooks';
import { Dropdown } from '../../elements/dropdown';
import { messages } from '../../messages';
import { Row } from '../row';
import {
  ACTIVE_TAB_MAP,
  ADD_FOR_ALL,
  CLEAR_FOR_ALL,
  NOT_CHANGED_FOR_ALL,
  REPLACE_FOR_ALL,
  SELECT_DEFECT_MANUALLY,
} from '../../constants';
import styles from './commentSection.scss';

const cx = classNames.bind(styles);

const BulkComment = ({ modalState, setModalState }) => {
  const { formatMessage } = useIntl();
  const wrapperRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const onToggle = () => setExpanded(!expanded);
  const clickOutside = () => setExpanded(false);
  useOnClickOutside(wrapperRef, clickOutside);
  const { decisionType } = modalState;
  const untouchedCommentOpt = [
    {
      ownValue: NOT_CHANGED_FOR_ALL,
      label: formatMessage(messages[NOT_CHANGED_FOR_ALL]),
    },
    {
      ownValue: CLEAR_FOR_ALL,
      label: formatMessage(messages[CLEAR_FOR_ALL]),
    },
  ];
  const touchedCommentOpt = [
    {
      ownValue: ADD_FOR_ALL,
      label: formatMessage(messages[ADD_FOR_ALL]),
    },
    {
      ownValue: REPLACE_FOR_ALL,
      label: formatMessage(messages[REPLACE_FOR_ALL]),
    },
  ];
  const currentSource = modalState[ACTIVE_TAB_MAP[decisionType]];

  useEffect(() => {
    if (!currentSource.issue.comment) {
      setModalState({ commentOption: untouchedCommentOpt[0].ownValue });
    }
    if (
      currentSource.issue.comment &&
      untouchedCommentOpt.some((option) => option.ownValue === modalState.commentOption)
    ) {
      setModalState({ commentOption: touchedCommentOpt[0].ownValue });
    }
  }, [currentSource.issue.comment]);

  const onChangeOption = (val) => {
    setModalState({ commentOption: val });
    onToggle();
  };

  const bulkComment = currentSource.issue.comment;

  return (
    <>
      <Row text={formatMessage(messages.commentWill)}>
        <Dropdown
          wrapperRef={wrapperRef}
          expanded={expanded}
          onToggle={onToggle}
          selectedOption={formatMessage(messages[modalState.commentOption])}
          optionValue={modalState.commentOption}
          onChangeOption={onChangeOption}
          options={bulkComment ? touchedCommentOpt : untouchedCommentOpt}
          className={{
            options: cx('options'),
            selectedOption: cx('selected-option'),
            dropdownWrapper: cx('dropdown-wrapper'),
            arrow: cx('dropdown-arrow'),
          }}
        />
      </Row>
      {bulkComment && <div className={cx('comment')}>{bulkComment}</div>}
    </>
  );
};
BulkComment.propTypes = {
  modalState: PropTypes.object,
  setModalState: PropTypes.func,
};
BulkComment.defaultProps = {
  modalState: {},
  setModalState: () => {},
};

export const CommentSection = ({ modalState, setModalState, isBulkOperation }) => {
  const { formatMessage } = useIntl();

  const { decisionType } = modalState;
  const currentSource = modalState[ACTIVE_TAB_MAP[decisionType]];
  const currentItemComment = modalState.currentTestItems[0].issue.comment;
  let comment;
  if (!isBulkOperation) {
    const commentChanged = currentSource.issue.comment !== currentItemComment;
    if (decisionType !== SELECT_DEFECT_MANUALLY && currentSource.issue.comment) {
      comment = currentSource.issue.comment || '';
    } else {
      comment = (commentChanged && currentSource.issue.comment) || '';
    }
  }

  return (
    <>
      {isBulkOperation ? (
        <BulkComment
          modalState={modalState}
          setModalState={setModalState}
          isBulkOperation={isBulkOperation}
        />
      ) : (
        <>
          {currentSource.issue.comment !== currentItemComment && (
            <>
              <Row
                text={formatMessage(
                  comment ? messages.commentReplaceWith : messages.commentWillRemoved,
                )}
              />
              {comment && <div className={cx('comment')}>{comment}</div>}
            </>
          )}
        </>
      )}
    </>
  );
};
CommentSection.propTypes = {
  modalState: PropTypes.object,
  isBulkOperation: PropTypes.bool,
  setModalState: PropTypes.func,
};
CommentSection.defaultProps = {
  modalState: {},
  isBulkOperation: false,
  setModalState: () => {},
};
