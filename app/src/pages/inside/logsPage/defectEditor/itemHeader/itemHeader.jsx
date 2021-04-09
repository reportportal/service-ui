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
import styles from './itemHeader.scss';

const cx = classNames.bind(styles);

export const ItemHeader = ({ item, selectItem, isSelected, preselected }) => {
  const {
    id,
    name,
    issue: { autoAnalyzed, ignoreAnalyzer, issueType, externalSystemIssues },
    patternTemplates,
  } = item;
  const getLogItemLink = useSelector(getLogItemLinkSelector);
  const link = getLogItemLink(item);

  return (
    <div
      className={cx('item-info', { selected: isSelected, preselected })}
      onClick={() => selectItem(isSelected ? null : id)}
    >
      <div className={cx('header')}>
        <Link to={link} target="_blank" className={cx('item-name')}>
          {name}
          <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
        </Link>
        <div className={cx('defect-block')}>
          {ignoreAnalyzer && <IgnoredInAALabel className={cx('ignore-aa-label')} />}
          {autoAnalyzed && <AutoAnalyzedLabel className={cx('aa-label')} />}
          {!!patternTemplates.length && (
            <PatternAnalyzedLabel
              patternTemplates={patternTemplates}
              className={cx('pa-label')}
              showTooltip
            />
          )}
          <DefectTypeItem type={issueType} className={cx('defect-type')} />
        </div>
      </div>
      <div className={cx('bts-row')}>
        <IssueList issues={externalSystemIssues} className={cx('issue')} readOnly />
      </div>
    </div>
  );
};
ItemHeader.propTypes = {
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  selectItem: PropTypes.func,
  nameLink: PropTypes.object,
  preselected: PropTypes.bool,
};
ItemHeader.defaultProps = {
  item: {},
  isSelected: false,
  selectItem: () => {},
  nameLink: {},
  preselected: false,
};
