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
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useIntl } from 'react-intl';
import CommentIcon from 'common/img/comment-inline.svg';
import { DefectTypeItemML } from 'pages/inside/common/defectTypeItemML';
import { defectTypesSelector } from 'controllers/project';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ExecutionInfo } from 'pages/inside/logsPage/defectEditor/executionInfo';
import { Accordion } from 'pages/inside/common/accordion';
import {
  CURRENT_EXECUTION_ONLY,
  SOURCE_DETAILS,
} from 'pages/inside/stepPage/modals/editDefectModals/constants';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import { LogItem } from 'pages/inside/logsPage/defectEditor/logItem';
import { messages } from './../../messages';
import styles from './optionsStepForm.scss';

const cx = classNames.bind(styles);

export const OptionsStepForm = ({ info, toggleAccordionTab, itemData }) => {
  const { formatMessage } = useIntl();
  const defectTypes = Object.values(useSelector(defectTypesSelector)).flat();
  const defectType = defectTypes.filter((type) => type.locator === info.issue.issueType)[0];
  const [accordionTabsState, setAccordionTabsState] = useState({
    [SOURCE_DETAILS]: true,
  });
  const [optionValue, setOptionValue] = useState(CURRENT_EXECUTION_ONLY);
  const options = [
    {
      ownValue: CURRENT_EXECUTION_ONLY,
      label: {
        id: CURRENT_EXECUTION_ONLY,
        defaultMessage: formatMessage(messages.currentExecutionOnly),
      },
    },
  ];

  const renderCommentBlock = () => {
    return (
      <div className={cx('comment-block')}>
        <span className={cx('icon')}>{Parser(CommentIcon)}</span>
        <ScrollWrapper autoHeight hideTracksWhenNotNeeded autoHeightMax={80}>
          <p className={cx('comment')}>{info.issue.comment}</p>
        </ScrollWrapper>
      </div>
    );
  };
  const tabsData = [
    {
      id: SOURCE_DETAILS,
      shouldShow: true,
      isOpen: accordionTabsState[SOURCE_DETAILS],
      title: formatMessage(messages.sourceDetails),
      content: (
        <>
          <div className={cx('content')}>
            {info.id ? (
              <div className={cx('execution-info-content')}>
                <ExecutionInfo item={info} />
                {info.issue.comment && renderCommentBlock()}
              </div>
            ) : (
              <div className={cx('defect-type-content')}>
                <DefectTypeItemML
                  className={cx('source-details-defect-type')}
                  defectType={defectType}
                />
                <div className={cx('defect-type-description')}>
                  {info.issue.comment && renderCommentBlock()}
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
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Accordion
        tabs={tabsData}
        toggleTab={(tabId) => toggleAccordionTab(tabId, accordionTabsState, setAccordionTabsState)}
      />
      <div className={cx('options-section')}>
        <div className={cx('header-block')}>
          <span className={cx('header')}>{formatMessage(messages.applyTo)}</span>
          <span className={cx('subheader')}>{formatMessage(messages.applyToSimilarItems)}:</span>
        </div>
        <div className={cx('options-block')}>
          <div className={cx('options')}>
            <InputRadioGroup
              value={optionValue}
              onChange={setOptionValue}
              options={options}
              classNameGroup={cx('radio-input-group')}
              classNameInput={{
                toggler: cx('input-toggler'),
                children: cx('input-children'),
              }}
            />
          </div>
          <div className={cx('items-list')}>
            {optionValue === CURRENT_EXECUTION_ONLY && (
              <LogItem item={itemData} showErrorLogs preselected />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
OptionsStepForm.propTypes = {
  info: PropTypes.object,
  toggleAccordionTab: PropTypes.func,
  itemData: PropTypes.object,
};
