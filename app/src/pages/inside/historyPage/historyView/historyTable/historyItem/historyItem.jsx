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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { SKIPPED, FAILED, INTERRUPTED } from 'common/constants/testStatuses';
import { calculateFontColor } from 'common/utils';
import CommentIcon from 'common/img/comment-inline.svg';
import TagIcon from 'common/img/tag-inline.svg';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { HistoryLineItemTooltip } from 'pages/inside/logsPage/historyLine/historyLineItem/historyLineItemTooltip';
import { updateItemsHistoryLaunchAttributesAction } from 'controllers/itemsHistory';
import { CELL_PREVIEW_ATTRIBUTE } from 'controllers/itemsHistory/constants';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { getAttributeValue, formatAttributeValue } from 'pages/inside/historyPage/utils';
import { DefectBadge } from './defectBadge/defectBadge';
import { MessageBadge } from './messageBadge/messageBadge';
import styles from './historyItem.scss';

const cx = classNames.bind(styles);

const statusesWithDefect = [FAILED, SKIPPED, INTERRUPTED];

@connect(null, { updateLaunchAttributes: updateItemsHistoryLaunchAttributesAction })
@withTooltip({
  TooltipComponent: HistoryLineItemTooltip,
  data: {
    dynamicWidth: true,
    placement: 'bottom',
    noMobile: true,
    dark: true,
    modifiers: {
      preventOverflow: { enabled: false },
      hide: { enabled: false },
    },
    tooltipTriggerClass: cx('tooltip-wrapper'),
  },
})
export class HistoryItem extends Component {
  static propTypes = {
    defectTypes: PropTypes.object.isRequired,
    testItem: PropTypes.object,
    selectedItems: PropTypes.arrayOf(PropTypes.object),
    selectable: PropTypes.bool,
    singleDefectView: PropTypes.bool,
    cellPreview: PropTypes.string,
    attributeKey: PropTypes.string,
    highlightLessThan: PropTypes.string,
    onSelectItem: PropTypes.func,
  };

  static defaultProps = {
    testItem: {},
    selectedItems: [],
    selectable: false,
    singleDefectView: false,
    cellPreview: '',
    attributeKey: '',
    highlightLessThan: '',
    onSelectItem: () => {},
  };

  isItemSelected = () =>
    this.props.selectedItems.some((item) => item.id === this.props.testItem.id);

  mapDefectsToBadges = () => {
    const {
      defectTypes,
      singleDefectView,
      testItem: {
        issue = {},
        statistics: { defects = {} },
      },
    } = this.props;

    return Object.keys(defects).map((key) => {
      let badge = '';
      if (defects[key].total) {
        const defectTypesGroup = defectTypes[key.toUpperCase()];
        let defectType = {};
        if (singleDefectView) {
          defectType = defectTypesGroup.find((el) => el.locator === issue.issueType) || {};
        } else {
          // use the main defect group type
          defectType = defectTypesGroup[0];
        }
        const { shortName, color: defectColor } = defectType;
        const fontColor = calculateFontColor(defectColor);

        badge = (
          <DefectBadge
            key={key}
            singleDefectView={singleDefectView}
            type={key}
            defectTitle={shortName}
            backgroundColor={defectColor}
            color={fontColor}
            data={defects[key]}
          />
        );
      }
      return badge;
    });
  };

  renderAttributeContent = () => {
    const { testItem, attributeKey } = this.props;
    const value = getAttributeValue(testItem.attributes, attributeKey);

    return (
      <div className={cx('attribute-content')}>
        <span className={cx('attribute-value')}>{formatAttributeValue(value)}</span>
      </div>
    );
  };

  handleItemSelection = () => {
    const { testItem, onSelectItem } = this.props;
    onSelectItem(testItem);
  };

  render() {
    const { testItem, selectable, cellPreview, attributeKey, highlightLessThan } = this.props;
    const { status, issue = {} } = testItem;
    const selected = selectable ? this.isItemSelected() : false;
    const isAttributeMode = cellPreview === CELL_PREVIEW_ATTRIBUTE && attributeKey && highlightLessThan;

    return (
      <div className={cx('history-item', { selectable, selected })}>
        {selectable && (
          <div className={cx('select-item-control')} onClick={(e) => e.stopPropagation()}>
            <InputCheckbox value={selected} onChange={this.handleItemSelection} />
          </div>
        )}

        {isAttributeMode ? (
          this.renderAttributeContent()
        ) : (
          <>
            {statusesWithDefect.indexOf(status) !== -1 && this.mapDefectsToBadges()}
            {issue.comment && (
              <MessageBadge data={[{ comment: issue.comment }]} icon={CommentIcon} />
            )}
            {issue.externalSystemIssues && issue.externalSystemIssues.length > 0 && (
              <MessageBadge data={issue.externalSystemIssues} icon={TagIcon} />
            )}
          </>
        )}
      </div>
    );
  }
}
