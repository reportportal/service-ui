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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Parser from 'html-react-parser';
import {
  SKIPPED,
  RESETED,
  FAILED,
  MANY,
  NOT_FOUND,
  INTERRUPTED,
} from 'common/constants/launchStatuses';
import NoItemIcon from 'common/img/noItem-inline.svg';
import EmptyItemIcon from 'common/img/emptyItem-inline.svg';
import NotEyeIcon from 'common/img/notEyeItem-inline.svg';
import CommentIcon from 'common/img/comment-inline.svg';
import TagIcon from 'common/img/tag-inline.svg';
import {
  AUTOMATION_BUG,
  NO_DEFECT,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from 'common/constants/defectTypes';

import { DefectBadge } from './defectBadge/defectBadge';
import { MessageBadge } from './messageBadge/messageBadge';
import styles from './historyItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  emptyItemCaption: {
    id: 'HistoryItem.emptyItemCaption',
    defaultMessage: 'Item is empty',
  },
  noItemCaption: {
    id: 'HistoryItem.noItemCaption',
    defaultMessage: 'No item<br/>in launch',
  },
  sameItemsCaption: {
    id: 'HistoryItem.sameItemsCaption',
    defaultMessage: "There're several items with the same UID meaning.",
  },
});

const defectsTitleMap = {
  [AUTOMATION_BUG]: 'ab',
  [NO_DEFECT]: 'nd',
  [PRODUCT_BUG]: 'pb',
  [SYSTEM_ISSUE]: 'si',
  [TO_INVESTIGATE]: 'ti',
};

@injectIntl
export class HistoryItem extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    status: PropTypes.string,
    issue: PropTypes.object,
    defects: PropTypes.object,
  };

  static defaultProps = {
    status: '',
    issue: {},
    defects: {},
  };

  mapDefectsToBadges = () => {
    const { defects } = this.props;

    return Object.keys(defects).map((key) => {
      let badge = '';
      if (defects[key].total) {
        badge = (
          <div key={key}>
            <DefectBadge type={key} defectTitle={defectsTitleMap[key]} data={defects[key]} />
          </div>
        );
      }
      return badge;
    });
  };

  renderResetedTextContent = () => (
    <Fragment>
      <i className={cx('icon')}>{Parser(EmptyItemIcon)}</i>
      <span>{this.props.intl.formatMessage(messages.emptyItemCaption)}</span>
    </Fragment>
  );

  renderManyTextContent = () => (
    <MessageBadge
      data={[{ ticketId: this.props.intl.formatMessage(messages.sameItemsCaption) }]}
      icon={NotEyeIcon}
    />
  );

  renderNotFoundTextContent = () => (
    <Fragment>
      <i className={cx('icon', 'no-item-icon')}>{Parser(NoItemIcon)}</i>
      <span>{Parser(this.props.intl.formatMessage(messages.noItemCaption))}</span>
    </Fragment>
  );

  renderTextContent = () => {
    switch (this.props.status.toLowerCase()) {
      case RESETED:
        return this.renderResetedTextContent();
      case NOT_FOUND:
        return this.renderNotFoundTextContent();
      case MANY:
        return this.renderManyTextContent();
      default:
        return '';
    }
  };

  render() {
    const { status, issue } = this.props;
    return (
      <div className={cx('item-content-wrapper')}>
        {status.toLowerCase() === (FAILED || SKIPPED || INTERRUPTED) && this.mapDefectsToBadges()}
        {issue.comment && <MessageBadge data={[{ ticketId: issue.comment }]} icon={CommentIcon} />}
        {issue.externalSystemIssues &&
          issue.externalSystemIssues.length > 0 && (
            <MessageBadge data={issue.externalSystemIssues} icon={TagIcon} />
          )}
        <div className={cx('item-text-content')}>{this.renderTextContent()}</div>
      </div>
    );
  }
}
