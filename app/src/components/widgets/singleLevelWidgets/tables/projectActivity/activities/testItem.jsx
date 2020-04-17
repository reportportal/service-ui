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
import { injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { URLS } from 'common/urls';
import { fetch, arrayDiffer } from 'common/utils';
import { UNLINK_ISSUE, LINK_ISSUE, POST_ISSUE } from 'common/constants/actionTypes';
import { getTestItemPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [LINK_ISSUE]: {
    id: 'TestItemChanges.linkIssue',
    defaultMessage: 'linked issue',
  },
  [UNLINK_ISSUE]: {
    id: 'TestItemChanges.unlinkIssue',
    defaultMessage: 'unlinked issue',
  },
  [POST_ISSUE]: {
    id: 'TestItemChanges.postIssue',
    defaultMessage: 'posted issue',
  },
  fromItem: {
    id: 'TestItemChanges.fromItem',
    defaultMessage: 'from test item',
  },
  toItem: {
    id: 'TestItemChanges.toItem',
    defaultMessage: 'to test item',
  },
});

@injectIntl
export class TestItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  state = {
    testItem: null,
  };

  componentDidMount() {
    fetch(URLS.testItem(this.props.activity.projectName, this.props.activity.loggedObjectId), {
      method: 'get',
    }).then((response) => {
      this.setState({ testItem: response });
    });
  }

  getTicketUrlId = (str) => {
    const ind = str.search(
      /(http|https):\/\/[a-z0-9\-_]+(\.[a-z0-9\-_]+)+([a-z0-9\-.,@?^=%&;:/~+#]*[a-z0-9\-@?^=%&;/~+#])?/i,
    );
    let obj = { id: str, url: null };
    if (ind >= 0) {
      obj = {
        id: str.slice(0, ind - 1),
        url: str.slice(ind),
      };
    }
    return obj;
  };

  getTickets = ({ details: { history = [{ newValue: '', oldValue: '' }] }, actionType }) => {
    const newTickets = history[0].newValue.split(',').filter((val) => val);
    const oldTickets = history[0].oldValue.split(',').filter((val) => val);
    return actionType === UNLINK_ISSUE
      ? arrayDiffer(oldTickets, newTickets)
      : arrayDiffer(newTickets, oldTickets);
  };

  getTestItemPath = () => {
    const { activity } = this.props;
    const path = this.state.testItem ? this.state.testItem.path.split('.') : [];

    // prevent duplicates in the last path segment
    if (path[path.length - 1] === String(activity.loggedObjectId)) {
      path.splice(-1, 1);
    }
    return (
      this.state.testItem &&
      `${this.state.testItem.launchId}/${path.join('/')}/${activity.loggedObjectId}`
    );
  };

  render() {
    const { activity, intl } = this.props;
    const pathToTestItem = this.getTestItemPath();

    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        {this.getTickets(activity).map((ticket, t, tickets) => {
          const ticketData = this.getTicketUrlId(ticket);
          const comma = tickets.length > 1 && t < tickets.length - 1 ? ',' : '';
          return (
            <a target="_blank" className={cx('link')} href={ticketData.url} key={`${t + 1}`}>
              {ticketData.id}
              {comma}
            </a>
          );
        })}{' '}
        {activity.actionType === UNLINK_ISSUE
          ? intl.formatMessage(messages.fromItem)
          : intl.formatMessage(messages.toItem)}
        <Link
          to={getTestItemPageLink(
            activity.projectName,
            pathToTestItem,
            this.state.testItem && this.state.testItem.type,
          )}
          className={cx('link')}
          target="_blank"
        >
          {activity.details.objectName}
        </Link>
      </Fragment>
    );
  }
}
