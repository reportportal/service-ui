import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
import { userIdSelector } from 'controllers/user';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './launchDeleteModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  deleteLaunchHeader: {
    id: 'DeleteLaunchDialog.deleteLaunchHeader',
    defaultMessage: 'Delete launch',
  },
  deleteLaunchText: {
    id: 'DeleteLaunchDialog.deleteLaunch',
    defaultMessage:
      "Are you sure to delete launch '<b>{name} #{number}</b>'? It will no longer exist.",
  },
  deleteLaunchWarning: {
    id: 'DeleteLaunchDialog.deleteLaunchWarning',
    defaultMessage:
      'You are going to delete not your own launch. This may affect other users information on the project.',
  },
});

@withModal('launchDeleteModal')
@injectIntl
@connect((state) => ({
  userId: userIdSelector(state),
}))
export class LaunchDeleteModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      onConfirm: PropTypes.func,
    }),
    userId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: {
      item: {},
      onConfirm: () => {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.data.onConfirm();
    closeModal();
  };

  render() {
    const { intl } = this.props;
    const { item } = this.props.data;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.DELETE),
      danger: true,
      onClick: this.confirmAndClose,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.deleteLaunchHeader)}
        okButton={okButton}
        cancelButton={cancelButton}
        warningMessage={
          item.owner !== this.props.userId ? intl.formatMessage(messages.deleteLaunchWarning) : null
        }
      >
        <p className={cx('message')}>
          {Parser(
            intl.formatMessage(messages.deleteLaunchText, { name: item.name, number: item.number }),
          )}
        </p>
      </ModalLayout>
    );
  }
}
