import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { withModal, ModalLayout } from 'components/main/modal';
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
});

@withModal('launchDeleteModal')
@injectIntl
export class LaunchDeleteModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      item: PropTypes.object,
      onConfirm: PropTypes.func,
    }),
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
