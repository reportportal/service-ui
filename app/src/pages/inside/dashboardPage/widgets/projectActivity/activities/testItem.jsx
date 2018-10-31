import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import arrayDiffer from 'array-differ';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { UNLINK_ISSUE, LINK_ISSUE, POST_ISSUE } from 'common/constants/actionTypes';
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
    intl: intlShape.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  state = {
    testItem: null,
  };

  componentDidMount() {
    fetch(URLS.testItem(this.props.activity.projectRef, this.props.activity.loggedObjectRef), {
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

  getTickets = (activity) => {
    const newTickets = activity.ticketId$newValue
      ? activity.ticketId$newValue.split(',').filter((val) => val)
      : [];
    const oldTickets = activity.ticketId$oldValue ? activity.ticketId$oldValue.split(',') : [];
    return activity.actionType === [UNLINK_ISSUE]
      ? arrayDiffer(oldTickets, newTickets)
      : arrayDiffer(newTickets, oldTickets);
  };

  render() {
    const { activity, intl } = this.props;
    const pathToTestItem =
      this.state.testItem &&
      `${this.state.testItem.launchId}/${Object.keys(this.state.testItem.path_names).join('/')}/${
        activity.loggedObjectRef
      }`;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.userRef}</span>
        {intl.formatMessage(messages[activity.actionType])}
        {this.getTickets(activity).map((ticket, t, tickets) => {
          const ticketData = this.getTicketUrlId(ticket);
          const coma = tickets.length > 1 && t < tickets.length - 1 ? ',' : '';
          return (
            <a target="_blank" className={cx('link')} href={ticketData.url} key={`${t + 1}`}>
              {ticketData.id}
              {coma}
            </a>
          );
        })}
        {activity.actionType === [UNLINK_ISSUE]
          ? intl.formatMessage(messages.fromItem)
          : intl.formatMessage(messages.toItem)}
        <a
          target="_blank"
          className={cx('link')}
          href={`#${activity.projectRef}/launches/all/${pathToTestItem}`}
        >
          {activity.name}
        </a>
      </Fragment>
    );
  }
}
