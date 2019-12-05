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
import { defineMessages, injectIntl } from 'react-intl';
import Link from 'redux-first-router-link';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { projectIdSelector, filterIdSelector, PROJECT_LOG_PAGE } from 'controllers/pages/index';
import { patternsSelector } from 'controllers/project';
import { getTicketUrlId } from 'common/utils/index';
import RightArrowIcon from 'common/img/arrow-right-small-inline.svg';
import { normalizeAndParse } from './utils';
import styles from './historyItem.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  basedOn: {
    id: 'LogItemInfo.basedOn',
    defaultMessage: 'Based on',
  },
  item: {
    id: 'LogItemInfo.item',
    defaultMessage: 'item',
  },
  ignoreAA: {
    id: 'LogItemInfo.ignoreAA',
    defaultMessage: 'Ignore in Auto Analysis',
  },
});

@injectIntl
@connect((state) => ({
  projectId: projectIdSelector(state),
  filterId: filterIdSelector(state),
  patterns: patternsSelector(state),
}))
export class HistoryItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    historyItem: PropTypes.shape({
      oldValue: PropTypes.string,
      newValue: PropTypes.string,
      field: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.string.isRequired,
    filterId: PropTypes.string.isRequired,
    patterns: PropTypes.array,
  };

  static defaultProps = {
    patterns: [],
  };

  isValueEmpty = (value) => value === '';

  renderAnalyzerIgnore = (value) =>
    value === 'true' ? this.props.intl.formatMessage(messages.ignoreAA) : null;

  renderValue(value) {
    const { historyItem } = this.props;

    switch (historyItem.field) {
      case 'relevantItem':
        return this.renderRelevantValue(value);
      case 'ticketId':
        return this.renderTicketValue(value);
      case 'ignoreAnalyzer':
        return this.renderAnalyzerIgnore(value);
      case 'patternId':
        return this.renderPatternValue(value);
      default:
        return value;
    }
  }

  renderRelevantValue(value) {
    const { projectId, filterId, intl } = this.props;

    try {
      const relevantItem = normalizeAndParse(value);
      const itemLink = {
        type: PROJECT_LOG_PAGE,
        payload: {
          projectId,
          filterId,
          testItemIds: [relevantItem.launchId, ...relevantItem.path.split('.')].join('/'),
        },
      };

      return (
        <Fragment>
          {intl.formatMessage(messages.basedOn)}{' '}
          <Link className={cx('link')} to={itemLink} target="_blank">
            {intl.formatMessage(messages.item)}
          </Link>
        </Fragment>
      );
    } catch (error) {
      return value;
    }
  }

  renderTicketValue = (value = '') => {
    const tickets = value ? value.split(',').map((item) => getTicketUrlId(item)) : '';

    return tickets.length > 0 ? (
      <Fragment>
        {tickets.map((ticket, i) => {
          const separator = i < tickets.length - 1 ? ',' : '';
          const ticketId = ticket.id.trim();

          return (
            <span key={ticketId}>
              {ticket ? (
                <a className={cx('link')} href={ticket.url} target="_blank">
                  {ticketId}
                </a>
              ) : (
                <span>{ticket}</span>
              )}
              <span>{separator}</span>
            </span>
          );
        })}
      </Fragment>
    ) : (
      value
    );
  };

  renderPatternValue = (value = '') =>
    (this.props.patterns.find((pattern) => pattern.id.toString() === value) || {}).name || '';

  render() {
    const { historyItem } = this.props;

    return (
      <div className={cx('container')}>
        <div className={cx('content', 'old', { empty: this.isValueEmpty(historyItem.oldValue) })}>
          <div className={cx('value')}>{this.renderValue(historyItem.oldValue)}</div>
        </div>
        <div className={cx('content', 'new')}>
          <div className={cx('new-icon')}>{Parser(RightArrowIcon)}</div>
          <div className={cx('value')}>{this.renderValue(historyItem.newValue)}</div>
        </div>
      </div>
    );
  }
}
