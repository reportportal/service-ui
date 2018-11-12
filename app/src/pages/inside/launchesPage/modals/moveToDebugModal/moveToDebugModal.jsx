import { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { injectIntl, intlShape } from 'react-intl';
import { fetchAPI } from 'common/utils';
import { tokenSelector } from 'controllers/auth';
import { URLS } from 'common/urls';
import { DEBUG, DEFAULT } from 'common/constants/common';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import styles from './moveToDebugModal.scss';
import { messages } from './translations';

const cx = classNames.bind(styles);

@withModal('moveLaunchesModal')
@injectIntl
@connect(
  (state) => ({
    url: URLS.launchUpdate(activeProjectSelector(state)),
    token: tokenSelector(state),
  }),
  {
    showNotification,
  },
)
@track()
export class MoveToDebugModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    url: PropTypes.string.isRequired,
    data: PropTypes.shape({
      fetchFunc: PropTypes.func,
      ids: PropTypes.array,
      debugMode: PropTypes.bool,
    }),
    showNotification: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    token: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: {
      fetchFunc: () => {},
      ids: [],
      debugMode: false,
    },
    showNotification: () => {},
  };

  moveAndClose = (closeModal) => {
    this.props.tracking.trackEvent(LAUNCHES_MODAL_EVENTS.CLICK_MOVE_BTN_MOVE_MODAL);
    const { ids, fetchFunc, debugMode } = this.props.data;
    const newMode = debugMode ? DEFAULT.toUpperCase() : DEBUG.toUpperCase();
    const entities = ids.reduce((acc, id) => ({ ...acc, [id]: { mode: newMode } }), {});
    fetchAPI(this.props.url, this.props.token, {
      method: 'put',
      data: {
        entities,
      },
    })
      .then(() => {
        let successMessage;
        if (ids.length > 1) {
          successMessage = debugMode
            ? this.props.intl.formatMessage(messages.moveToAllMultipleSuccessMessage)
            : this.props.intl.formatMessage(messages.moveToDebugMultipleSuccessMessage);
        } else {
          successMessage = debugMode
            ? this.props.intl.formatMessage(messages.moveToAllSuccessMessage)
            : this.props.intl.formatMessage(messages.moveToDebugSuccessMessage);
        }
        this.props.showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        fetchFunc();
      })
      .catch((response) => {
        let errorMessage;
        if (ids.length > 1) {
          errorMessage = debugMode
            ? messages.moveToAllMultipleErrorMessage
            : messages.moveToDebugMultipleErrorMessage;
        } else {
          errorMessage = debugMode
            ? messages.moveToAllErrorMessage
            : messages.moveToDebugErrorMessage;
        }
        this.props.showNotification({
          message: this.props.intl.formatMessage(errorMessage, {
            message: response.message,
          }),
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
    closeModal();
  };

  render() {
    const { intl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE),
      onClick: this.moveAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: LAUNCHES_MODAL_EVENTS.CLICK_CANCEL_BTN_MOVE_MODAL,
    };
    let text;
    if (data.ids.length > 1) {
      text = data.debugMode
        ? this.props.intl.formatMessage(messages.moveToAllMultipleText)
        : this.props.intl.formatMessage(messages.moveToDebugMultipleText);
    } else {
      text = data.debugMode
        ? this.props.intl.formatMessage(messages.moveToAllText)
        : this.props.intl.formatMessage(messages.moveToDebugText);
    }
    return (
      <ModalLayout
        title={
          data.debugMode
            ? intl.formatMessage(messages.moveToAllHeader)
            : intl.formatMessage(messages.moveToDebugHeader)
        }
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={LAUNCHES_MODAL_EVENTS.CLOSE_ICON_MOVE_MODAL}
      >
        <p className={cx('message')}>{text}</p>
      </ModalLayout>
    );
  }
}
