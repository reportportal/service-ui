/*
 * Copyright 2019 EPAM Systems
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
import { connect } from 'react-redux';
import Link from 'redux-first-router-link';
import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { formatDuration } from 'common/utils';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { TestItemStatus } from 'pages/inside/common/testItemStatus';
import { DefectTypeItem } from 'pages/inside/common/defectTypeItem';
import { PatternAnalyzedLabel } from 'pages/inside/common/patternAnalyzedLabel';
import Parser from 'html-react-parser';
import ClockIcon from 'common/img/clock-icon-inline.svg';
import InfoIcon from 'common/img/info-inline.svg';
import { getLogItemLinkSelector } from 'controllers/testItem';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { ItemPathTooltip } from 'pages/inside/common/itemPathTooltip';
import { StackTraceMessageBlock } from 'pages/inside/common/stackTraceMessageBlock';
import styles from './itemsListRow.scss';

const cx = classNames.bind(styles);

const StepDuration = ({ duration }) => (
  <div className={cx('duration-block')}>
    <div className={cx('icon')}>{Parser(ClockIcon)}</div>
    <span className={cx('time')}>{formatDuration(duration * 1000, true)}</span>
  </div>
);

StepDuration.propTypes = {
  duration: PropTypes.number,
};

StepDuration.defaultProps = {
  duration: 0,
};

const ItemPathTooltipIcon = withTooltip({
  TooltipComponent: ItemPathTooltip,
  data: {
    noArrow: false,
    width: 600,
  },
})(() => <div className={cx('path', 'icon')}>{Parser(InfoIcon)}</div>);

@connect((state) => ({
  getLogItemLink: getLogItemLinkSelector(state),
}))
export class ItemsListRow extends React.Component {
  static propTypes = {
    onToggleItemSelect: PropTypes.func,
    getLogItemLink: PropTypes.func,
    selected: PropTypes.bool,
    testItem: PropTypes.object,
  };

  static defaultProps = {
    onToggleItemSelect: () => {},
    getLogItemLink: () => {},
    selected: false,
    testItem: {},
  };

  toggleSelect = () => {
    this.props.onToggleItemSelect(this.props.testItem, !this.props.selected);
  };

  renderLogMessages = () => {
    const { logs } = this.props.testItem;
    return logs.map((log, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <StackTraceMessageBlock key={`log-message-${index}`} level={log.level}>
        <div className={cx('message')}>{log.message}</div>
      </StackTraceMessageBlock>
    ));
  };

  render() {
    const { selected, testItem } = this.props;
    return (
      <div className={cx('row')}>
        <div className={cx('selection-column')}>
          <InputCheckbox value={selected} onChange={this.toggleSelect} />
        </div>
        <div className={cx('info-column')}>
          <div className={cx('item-header')}>
            <ItemPathTooltipIcon testItem={testItem} />
            <div className={cx('item-name')}>
              <Link
                to={this.props.getLogItemLink(testItem)}
                className={cx('item-link')}
                target="_blank"
                title={testItem.itemName}
              >
                {testItem.itemName}
              </Link>
            </div>
            <div className={cx('item-detail')}>
              <div className={cx('duration')}>
                <StepDuration duration={testItem.duration} />
              </div>
              <div className={cx('status')}>
                <TestItemStatus status={testItem.status} />
              </div>
              {!!testItem.patternTemplates.length && (
                <div className={cx('pa-label')}>
                  <PatternAnalyzedLabel patternTemplates={testItem.patternTemplates} />
                </div>
              )}
              <div className={cx('issueType')}>
                <DefectTypeItem type={testItem.issue.issueType} />
              </div>
            </div>
          </div>
          {this.renderLogMessages()}
        </div>
      </div>
    );
  }
}
