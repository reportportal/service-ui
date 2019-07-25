import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { STOPPED } from 'common/constants/launchStatuses';
import styles from './launchFinishForceModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  finishForceLaunchHeader: {
    id: 'LaunchFinishForceDialog.finishForceLaunchHeader',
    defaultMessage: 'Force finish',
  },
  finishForceLaunchText: {
    id: 'LaunchFinishForceDialog.finishForceLaunchText',
    defaultMessage: 'Are you sure you want to finish the launch? All data will be missed.',
  },
  forceFinishSuccessMessage: {
    id: 'LaunchFinishForceDialog.forceFinishSuccessMessage',
    defaultMessage: 'Launch was successfully forced to finish',
  },
  forceFinishSuccessMultipleMessage: {
    id: 'LaunchFinishForceDialog.forceFinishSuccessMultipleMessage',
    defaultMessage: 'Launches was successfully forced to finish',
  },
  forceFinishFailedMessage: {
    id: 'LaunchFinishForceDialog.forceFinishFailedMessage',
    defaultMessage: 'Failed to force finish the launch: {message}',
  },
  forceFinishFailedMultipleMessage: {
    id: 'LaunchFinishForceDialog.forceFinishFailedMultipleMessage',
    defaultMessage: 'Failed to finish the launches: {message}',
  },
  finishForceMultipleText: {
    id: 'LaunchFinishForceDialog.finishForceMultipleText',
    defaultMessage: 'Are you sure you want to finish selected launches? All data will be missed.',
  },
  finishForceLaunchWarning: {
    id: 'LaunchFinishForceDialog.finishForceLaunchWarning',
    defaultMessage:
      'You are going to stop not your own launch. This may affect other users information on the project.',
  },
});

@withModal('launchFinishForceModal')
@injectIntl
@connect(
  (state) => ({
    userId: userIdSelector(state),
    url: URLS.launchStop(activeProjectSelector(state)),
  }),
  {
    showNotification,
  },
)
export class LaunchFinishForceModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    url: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    data: PropTypes.shape({
      fetchFunc: PropTypes.func,
      items: PropTypes.array,
    }),
    showNotification: PropTypes.func,
  };

  static defaultProps = {
    data: {
      fetchFunc: () => {},
      items: [],
    },
    showNotification: () => {},
  };

  finishAndClose = (closeModal) => {
    const { items, fetchFunc } = this.props.data;
    const entities = items.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: {
          endTime: Date.now(),
          status: STOPPED.toUpperCase(),
        },
      }),
      {},
    );
    fetch(this.props.url, {
      method: 'put',
      data: {
        entities,
      },
    })
      .then(() => {
        const successMessage =
          (items.length > 1 && messages.forceFinishSuccessMultipleMessage) ||
          messages.forceFinishSuccessMessage;
        this.props.showNotification({
          message: this.props.intl.formatMessage(successMessage),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        fetchFunc();
      })
      .catch((response) => {
        const errorMessage =
          (items.length > 1 && messages.forceFinishFailedMultipleMessage) ||
          messages.forceFinishFailedMessage;
        this.props.showNotification({
          message: this.props.intl.formatMessage(errorMessage, {
            message: response.message,
          }),
          type: NOTIFICATION_TYPES.ERROR,
        });
      })
      .then(() => {
        closeModal();
      });
  };

  render() {
    const { intl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.FINISH),
      danger: true,
      onClick: this.finishAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.finishForceLaunchHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={
          (data.items.some((item) => item.owner !== this.props.userId) &&
            intl.formatMessage(messages.finishForceLaunchWarning)) ||
          ''
        }
      >
        <p className={cx('message')}>
          {(data.items.length > 1 &&
            Parser(intl.formatMessage(messages.finishForceMultipleText))) ||
            Parser(intl.formatMessage(messages.finishForceLaunchText))}
        </p>
      </ModalLayout>
    );
  }
}
