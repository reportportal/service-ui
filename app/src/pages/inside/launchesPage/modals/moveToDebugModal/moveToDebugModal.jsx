import { Component } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
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
});

@withModal('moveToDebugModal')
@injectIntl
export class MoveToDebugModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.shape({
      onConfirm: PropTypes.func,
    }),
  };

  static defaultProps = {
    data: {
      onConfirm: () => {},
    },
  };
  confirmAndClose = (closeModal) => {
    this.props.data.onConfirm();
    closeModal();
  };

  render() {
    const { intl } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.MOVE),
      onClick: this.confirmAndClose,
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
        <p className={cx('message')}>{Parser(intl.formatMessage(messages.moveToDebugText))}</p>
      </ModalLayout>
    );
  }
}
