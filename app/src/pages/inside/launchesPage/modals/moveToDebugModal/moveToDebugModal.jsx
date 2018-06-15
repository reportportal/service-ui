import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { DEBUG } from 'common/constants/common';
import { activeProjectSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { withModal, ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './moveToDebugModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  moveToDebugHeader: {
    id: 'MoveToDebugDialog.moveToDebugHeader',
    defaultMessage: 'Move to debug',
  },
  moveToDebugText: {
    id: 'MoveToDebugDialog.moveToDebug',
    defaultMessage: 'Are you sure you want to move launch to Debug?',
  },
  moveToDebugMultipleText: {
    id: 'MoveToDebugDialog.moveToDebugMultiple',
    defaultMessage: 'Are you sure you want to move selected launches to Debug?',
  },
  moveToDebugFailedMessage: {
    id: 'MoveToDebugDialog.moveToDebugFailedMessage',
    defaultMessage: 'Failed to move to debug the launch: {message}',
  },
  moveToDebugSuccessMessage: {
    id: 'MoveToDebugDialog.moveToDebugSuccessMessage',
    defaultMessage: 'Launch has been successfully shifted to debug',
  },
  moveToDebugMultipleSuccessMessage: {
    id: 'MoveToDebugDialog.moveToDebugMultipleSuccessMessage',
    defaultMessage: 'Launches have been successfully shifted to debug',
  },
});

@withModal('moveToDebugModal')
@injectIntl
@connect(
  (state) => ({
    url: URLS.launchUpdate(activeProjectSelector(state)),
  }),
  {
    showNotification,
  },
)
export class MoveToDebugModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    url: PropTypes.string.isRequired,
    data: PropTypes.shape({
      fetchFunc: PropTypes.func,
      ids: PropTypes.array,
    }),
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    data: {
      fetchFunc: () => {},
      ids: [],
    },
    showNotification: () => {},
  };

  moveAndClose = (closeModal) => {
    const { ids, fetchFunc } = this.props.data;

    const entities = ids.reduce((acc, id) => ({ ...acc, [id]: { mode: DEBUG.toUpperCase() } }), {});
    fetch(this.props.url, {
      method: 'put',
      data: {
        entities,
      },
    })
      .then(() => {
        const successMessage =
          ids.length > 1
            ? this.props.intl.formatMessage(messages.moveToDebugMultipleSuccessMessage)
            : this.props.intl.formatMessage(messages.moveToDebugSuccessMessage);
        this.props.showNotification({
          message: successMessage,
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        fetchFunc();
      })
      .catch((response) => {
        this.props.showNotification({
          message: this.props.intl.formatMessage(messages.moveToDebugFailedMessage, {
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
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.moveToDebugHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('message')}>
          {data.ids.length > 1
            ? Parser(intl.formatMessage(messages.moveToDebugMultipleText))
            : Parser(intl.formatMessage(messages.moveToDebugText))}
        </p>
      </ModalLayout>
    );
  }
}
