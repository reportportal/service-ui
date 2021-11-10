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
import Link from 'redux-first-router-link';
import { useSelector } from 'react-redux';
import { getLogItemLinkSelector } from 'controllers/testItem/selectors';
import Parser from 'html-react-parser';
import { IssueList } from 'pages/inside/stepPage/stepGrid/defectType/issueList';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import ExternalLinkIcon from 'common/img/go-to-another-page-inline.svg';
import classNames from 'classnames/bind';
import { IgnoredInAALabel } from 'pages/inside/stepPage/stepGrid/defectType/defectType';
import { PatternAnalyzedLabel } from 'pages/inside/common/patternAnalyzedLabel';
import { AutoAnalyzedLabel } from 'pages/inside/stepPage/stepGrid/defectType/autoAnalyzedLabel';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputRadio } from 'components/inputs/inputRadio';
import { HistoryLineItemContent } from 'pages/inside/logsPage/historyLine/historyLineItem';
import { defectTypesSelector } from 'controllers/project';
import {
  CHECKBOX_TEST_ITEM_DETAILS,
  DEFAULT_TEST_ITEM_DETAILS,
  RADIO_TEST_ITEM_DETAILS,
} from '../../constants';
import styles from './itemHeader.scss';

const cx = classNames.bind(styles);

export const ItemHeader = ({
  item,
  selectItem,
  isSelected,
  hideLabels,
  onClickLinkEvent,
  mode,
  toggleDetails,
}) => {
  const {
    id,
    name,
    issue: { autoAnalyzed, ignoreAnalyzer, issueType, externalSystemIssues },
    patternTemplates,
  } = item;
  const defectTypes = useSelector(defectTypesSelector);
  const getLogItemLink = useSelector(getLogItemLinkSelector);
  const link = getLogItemLink(item);

  return (
    <div
      className={cx('item-info', {
        'height-40': mode === CHECKBOX_TEST_ITEM_DETAILS,
      })}
      onClick={toggleDetails}
    >
      <div className={cx('header')}>
        {mode !== DEFAULT_TEST_ITEM_DETAILS && (
          <div>
            {mode === CHECKBOX_TEST_ITEM_DETAILS && (
              <InputCheckbox
                className={cx('checkbox-margin-right')}
                value={isSelected}
                onChange={() => selectItem(id)}
              />
            )}
            {mode === RADIO_TEST_ITEM_DETAILS && (
              <InputRadio
                size={'small'}
                mode={'dark'}
                value={isSelected}
                ownValue
                onChange={() => selectItem(id)}
              />
            )}
          </div>
        )}
        <div className={cx('header-content')}>
          <Link to={link} target="_blank" className={cx('item-name')} onClick={onClickLinkEvent}>
            <span title={name}>{name}</span>
            <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
          </Link>
          {mode === DEFAULT_TEST_ITEM_DETAILS && (
            <div className={cx('defect-block')}>
              {!hideLabels && ignoreAnalyzer && (
                <IgnoredInAALabel className={cx('ignore-aa-label')} />
              )}
              {!hideLabels && autoAnalyzed && <AutoAnalyzedLabel className={cx('aa-label')} />}
              {!hideLabels && !!patternTemplates.length && (
                <PatternAnalyzedLabel
                  patternTemplates={patternTemplates}
                  className={cx('pa-label')}
                  showTooltip
                />
              )}
              <DefectTypeItem type={issueType} className={cx('defect-type')} />
            </div>
          )}
          {mode === RADIO_TEST_ITEM_DETAILS && (
            <div className={cx('history-line-block')}>
              <div className={cx('history-line-item')}>
                <HistoryLineItemContent
                  defectTypes={defectTypes}
                  showTriangles={false}
                  testItem={item}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {!!externalSystemIssues.length && mode !== CHECKBOX_TEST_ITEM_DETAILS && (
        <div className={cx('bts-row')}>
          <IssueList issues={externalSystemIssues} className={cx('issue')} readOnly />
        </div>
      )}
    </div>
  );
};
ItemHeader.propTypes = {
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  selectItem: PropTypes.func,
  hideLabels: PropTypes.bool,
  onClickLinkEvent: PropTypes.func,
  mode: PropTypes.string,
  toggleDetails: PropTypes.func,
};
ItemHeader.defaultProps = {
  item: {},
  isSelected: false,
  selectItem: () => {},
  hideLabels: false,
  onClickLinkEvent: () => {},
  mode: '',
  toggleDetails: () => {},
};
