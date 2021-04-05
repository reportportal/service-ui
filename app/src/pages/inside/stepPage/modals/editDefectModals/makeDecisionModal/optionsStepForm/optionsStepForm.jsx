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
import classNames from 'classnames/bind';
import CommentIcon from 'common/img/comment-inline.svg';
import { DefectTypeItemML } from 'pages/inside/common/defectTypeItemML';
import { useSelector } from 'react-redux';
import { defectTypesSelector } from 'controllers/project';
import Parser from 'html-react-parser';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ExecutionInfo } from 'pages/inside/logsPage/defectEditor/executionInfo';
import { useIntl } from 'react-intl';
import { messages } from './../../messages';
import styles from './optionsStepForm.scss';

const cx = classNames.bind(styles);

export const OptionsStepForm = ({ info }) => {
  const { formatMessage } = useIntl();
  const defectTypes = Object.values(useSelector(defectTypesSelector)).flat();
  const defectType = defectTypes.filter((type) => type.locator === info.issue.issueType)[0];

  const renderCommentBlock = () => {
    return (
      <div className={cx('comment-block')}>
        <span className={cx('icon')}>{Parser(CommentIcon)}</span>
        <ScrollWrapper
          className={cx('scroll')}
          autoHeight
          hideTracksWhenNotNeeded
          autoHeightMax={80}
        >
          <p className={cx('comment')}>{info.issue.comment || 'Comment'}</p>
        </ScrollWrapper>
      </div>
    );
  };
  return (
    <>
      <div className={cx('header')}>{formatMessage(messages.initialDetailsTitle)}</div>
      <div className={cx('content')}>
        {info.id ? (
          <div className={cx('execution-info-content')}>
            <div className={cx('execution-item')}>
              <ExecutionInfo item={info} />
            </div>
            {renderCommentBlock()}
          </div>
        ) : (
          <div className={cx('defect-type-content')}>
            <DefectTypeItemML
              className={cx('initial-details-defect-type')}
              isSelected={false}
              defectType={defectType}
            />
            <div className={cx('defect-type-description')}>
              {renderCommentBlock()}
              {
                <div className={cx('analys-block')}>
                  <span className={cx('analys-icon')}>AA</span>
                  <p>
                    {info.issue.ignoreAnalyzer
                      ? formatMessage(messages.excludedFromAa)
                      : formatMessage(messages.includedToAa)}
                  </p>
                </div>
              }
            </div>
          </div>
        )}
      </div>
    </>
  );
};
OptionsStepForm.propTypes = {
  info: PropTypes.object,
};
