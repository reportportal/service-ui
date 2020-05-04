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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SKIPPED, FAILED, INTERRUPTED } from 'common/constants/testStatuses';
import CommentIcon from 'common/img/comment-inline.svg';
import TagIcon from 'common/img/tag-inline.svg';
import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { ItemPathTooltip } from 'pages/inside/common/itemPathTooltip';
import { InputCheckbox } from 'components/inputs/inputCheckbox';

import { DefectBadge } from './defectBadge/defectBadge';
import { MessageBadge } from './messageBadge/messageBadge';
import styles from './historyItem.scss';

const cx = classNames.bind(styles);

const defectsTitleMap = {
  [AUTOMATION_BUG]: 'ab',
  [NO_DEFECT]: 'nd',
  [PRODUCT_BUG]: 'pb',
  [SYSTEM_ISSUE]: 'si',
  [TO_INVESTIGATE]: 'ti',
};

const statusesWithDefect = [FAILED, SKIPPED, INTERRUPTED];

@withTooltip({
  TooltipComponent: ItemPathTooltip,
  data: {
    width: 235,
    placement: 'right',
    noArrow: true,
    desktopOnly: true,
    tooltipTriggerClass: cx('tooltip-wrapper'),
  },
})
export class HistoryItem extends Component {
  static propTypes = {
    testItem: PropTypes.object,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    selectable: PropTypes.bool,
    onSelectItem: PropTypes.func,
  };

  static defaultProps = {
    testItem: {},
    selectedItems: [],
    selectable: false,
    onSelectItem: () => {},
  };

  isItemSelected = () =>
    this.props.selectedItems.some((item) => item.id === this.props.testItem.id);

  mapDefectsToBadges = () => {
    const {
      statistics: { defects = {} },
    } = this.props.testItem;

    return Object.keys(defects).map((key) => {
      let badge = '';
      if (defects[key].total) {
        badge = (
          <div key={key}>
            <DefectBadge defectTitle={defectsTitleMap[key]} />
          </div>
        );
      }
      return badge;
    });
  };

  handleItemSelection = () => {
    const { testItem, onSelectItem } = this.props;
    onSelectItem(testItem);
  };

  render() {
    const { testItem, selectable } = this.props;
    const { status, issue = {} } = testItem;
    const selected = selectable ? this.isItemSelected() : false;

    return (
      <div className={cx('history-item', { selectable, selected })}>
        {selectable && (
          <div className={cx('select-item-control')} onClick={(e) => e.stopPropagation()}>
            <InputCheckbox value={selected} onChange={this.handleItemSelection} />
          </div>
        )}
        {statusesWithDefect.indexOf(status) !== -1 && this.mapDefectsToBadges()}
        {issue.comment && <MessageBadge data={[{ ticketId: issue.comment }]} icon={CommentIcon} />}
        {issue.externalSystemIssues && issue.externalSystemIssues.length > 0 && (
          <MessageBadge data={issue.externalSystemIssues} icon={TagIcon} />
        )}
      </div>
    );
  }
}
