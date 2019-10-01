import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { showModalAction } from 'controllers/modal';
import { convertNotificationCaseForSubmission } from '../utils';
import { AddNewCaseButton } from '../addNewCaseButton';
import { CaseListItem } from './caseListItem';
import styles from './notificationCasesList.scss';

const cx = classNames.bind(styles);

@track()
@connect(null, {
  showModal: showModalAction,
})
export class NotificationCaseList extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    showModal: PropTypes.func,
    cases: PropTypes.array,
    readOnly: PropTypes.bool,
    updateNotificationCases: PropTypes.func,
  };
  static defaultProps = {
    updateNotificationCases: () => {},
    showModal: () => {},
    cases: [],
    readOnly: false,
  };

  onDelete = (id) => {
    const { showModal, tracking } = this.props;

    tracking.trackEvent(SETTINGS_PAGE_EVENTS.CLICK_ON_DELETE_RULE_NOTIFICATIONS);
    showModal({
      id: 'deleteNotificationCaseModal',
      data: {
        id,
        onConfirm: () => this.confirmDeleteCase(id),
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_DELETE_RULE_NOTIFICATIONS,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_DELETE_RULE_NOTIFICATIONS,
          deleteBtn: SETTINGS_PAGE_EVENTS.DELETE_RULE_NOTIFICATIONS,
        },
      },
    });
  };

  onEdit = (id, notificationCase) => {
    const { showModal, tracking } = this.props;

    tracking.trackEvent(SETTINGS_PAGE_EVENTS.EDIT_RULE_NOTIFICATIONS);
    showModal({
      id: 'addEditNotificationCaseModal',
      data: {
        onConfirm: (data) => this.confirmEditCase(id, data),
        notificationCase,
        eventsInfo: {
          closeIcon: SETTINGS_PAGE_EVENTS.CLOSE_ICON_EDIT_RULE_NOTIFICATIONS,
          cancelBtn: SETTINGS_PAGE_EVENTS.CANCEL_EDIT_RULE_NOTIFICATIONS,
          saveBtn: SETTINGS_PAGE_EVENTS.SAVE_EDIT_RULE_NOTIFICATIONS,
        },
      },
    });
  };

  confirmDeleteCase = (id) => {
    const { cases: oldCases, updateNotificationCases } = this.props;
    const cases = oldCases
      .filter((item, index) => index !== id)
      .map(convertNotificationCaseForSubmission);
    updateNotificationCases({ cases });
  };

  confirmEditCase = (id, data) => {
    const { cases: oldCases, updateNotificationCases } = this.props;
    const updatedCases = [...oldCases];
    updatedCases.splice(id, 1, data);
    const cases = updatedCases.map(convertNotificationCaseForSubmission);
    updateNotificationCases({ cases });
  };

  render() {
    const { cases, readOnly, updateNotificationCases } = this.props;

    return (
      <Fragment>
        {cases.map((item, id) => (
          <CaseListItem
            key={`index_${id}`} // eslint-disable-line react/no-array-index-key
            id={id}
            item={convertNotificationCaseForSubmission(item)}
            onDelete={() => this.onDelete(id)}
            onEdit={() => this.onEdit(id, item)}
            readOnly={readOnly}
          />
        ))}
        <div className={cx('notification-form-button')}>
          <AddNewCaseButton
            cases={cases}
            updateNotificationCases={updateNotificationCases}
            disabled={readOnly}
          />
        </div>
      </Fragment>
    );
  }
}
