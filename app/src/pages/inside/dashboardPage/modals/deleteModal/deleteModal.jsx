import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { DASHBOARD_PAGE_EVENTS } from 'components/main/analytics/events';
import { ModalLayout, withModal } from 'components/main/modal';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import styles from './dashboardDeleteModal.scss';

const cx = classNames.bind(styles);

@withModal('dashboardDeleteModal')
@track()
export class DeleteModal extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    data: {},
  };

  render() {
    const {
      message,
      dashboardItem,
      onSubmit,
      isCurrentUser,
      title,
      submitText,
      warningMessage,
      cancelText,
    } = this.props.data;
    const warning = isCurrentUser ? '' : warningMessage;

    return (
      <ModalLayout
        title={title}
        okButton={{
          text: submitText,
          danger: true,
          onClick: (closeModal) => {
            this.props.tracking.trackEvent(DASHBOARD_PAGE_EVENTS.DELETE_BTN_DELETE_DASHBOARD_MODAL);
            closeModal();
            onSubmit(dashboardItem);
          },
        }}
        closeIconEventInfo={DASHBOARD_PAGE_EVENTS.CLOSE_ICON_DELETE_DASHBOARD_MODAL}
        cancelButton={{
          text: cancelText,
          eventInfo: DASHBOARD_PAGE_EVENTS.CANCEL_BTN_DELETE_DASHBOARD_MODAL,
        }}
        warningMessage={warning}
      >
        <p className={cx('message')}>{Parser(message)}</p>
      </ModalLayout>
    );
  }
}
