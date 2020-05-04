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
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { RESETED, NOT_FOUND } from 'common/constants/testStatuses';
import NoItemIcon from 'common/img/noItem-inline.svg';
import EmptyItemIcon from 'common/img/emptyItem-inline.svg';
import styles from './emptyHistoryItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  emptyItemCaption: {
    id: 'EmptyHistoryItem.emptyItemCaption',
    defaultMessage: 'Item is empty',
  },
});

@injectIntl
export class EmptyHistoryItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    status: PropTypes.string,
  };

  static defaultProps = {
    status: '',
  };

  renderResetedTextContent = () => (
    <Fragment>
      <i className={cx('icon')}>{Parser(EmptyItemIcon)}</i>
      <span>{this.props.intl.formatMessage(messages.emptyItemCaption)}</span>
    </Fragment>
  );

  renderNotFoundTextContent = () => (
    <i className={cx('icon', 'no-item-icon')}>{Parser(NoItemIcon)}</i>
  );

  renderTextContent = () => {
    switch (this.props.status) {
      case RESETED:
        return this.renderResetedTextContent();
      case NOT_FOUND:
        return this.renderNotFoundTextContent();
      default:
        return '';
    }
  };

  render() {
    return (
      <div className={cx('empty-history-item')}>
        <div className={cx('item-text-content')}>{this.renderTextContent()}</div>
      </div>
    );
  }
}
