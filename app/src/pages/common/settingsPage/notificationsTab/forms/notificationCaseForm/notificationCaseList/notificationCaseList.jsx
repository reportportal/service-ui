/*  This file has one disabled eslint rule. This is made, because in examples redux-form Fields Array array indexes
    are used as key for react components
  */
import React, { Component, Fragment } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { GhostButton } from 'components/buttons/ghostButton';
import { SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { defaultCase } from 'pages/common/settingsPage/notificationsTab/forms/constants';
import PlusIcon from 'common/img/plus-button-inline.svg';
import { NotificationCase } from './notificationCase/index';
import styles from './notificationCasesList.scss';

const messages = defineMessages({
  addNewRuleButton: {
    id: 'NotificationCaseList.addNewRuleButton',
    defaultMessage: 'Add New Rule',
  },
});
const cx = classNames.bind(styles);

@injectIntl
@connect(null, {
  showModal: showModalAction,
})
@track()
export class NotificationCaseList extends Component {
  static propTypes = {
    showModal: PropTypes.func,
    intl: intlShape.isRequired,
    configurable: PropTypes.bool,
    fields: PropTypes.object,
    readOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  static defaultProps = {
    showModal: () => {},
    configurable: false,
    fields: {},
    readOnly: false,
  };

  onDelete = (index, showConfirmation) => {
    const { showModal } = this.props;

    if (showConfirmation) {
      showModal({
        id: 'deleteNotificationCaseModal',
        data: {
          index: index + 1,
          onSubmit: () => this.removeNotificationCase(index),
        },
      });
    } else {
      this.removeNotificationCase(index);
    }
  };

  getNumberOfConfirmedRules = (fields) =>
    fields.getAll().filter(({ confirmed }) => confirmed).length;

  addNotificationCase = () => {
    this.props.tracking.trackEvent(SETTINGS_PAGE_EVENTS.ADD_RULE_BTN_NOTIFICATIONS);
    this.props.fields.push(defaultCase);
  };

  removeNotificationCase = (index) => this.props.fields.remove(index);

  render() {
    const { intl, fields, readOnly } = this.props;
    const numberOfConfirmedRules = this.getNumberOfConfirmedRules(fields);
    const totalNumberOfFields = fields.length;
    const { submit } = this;

    return (
      <Fragment>
        {fields.map((item, id, fieldsArray) => {
          const { submitted, confirmed } = fieldsArray.get(id);
          const customProps = {
            submitted,
            readOnly,
            submit,
            confirmed,
            numberOfConfirmedRules,
            totalNumberOfFields,
          };

          return (
            <NotificationCase
              key={`index_${id}`} // eslint-disable-line react/no-array-index-key
              id={id}
              notificationCase={item}
              onDelete={this.onDelete}
              {...customProps}
            />
          );
        })}
        {!readOnly && (
          <div className={cx('notification-form-button')}>
            <GhostButton icon={PlusIcon} onClick={this.addNotificationCase}>
              {intl.formatMessage(messages.addNewRuleButton)}
            </GhostButton>
          </div>
        )}
      </Fragment>
    );
  }
}
