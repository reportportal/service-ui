import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './regenerateUuidModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'RegenerateUuidModal.header',
    defaultMessage: 'Regenerate uuid',
  },
  warning: {
    id: 'RegenerateUuidModal.warning',
    defaultMessage: 'Warning!',
  },
  text: {
    id: 'RegenerateUuidModal.text',
    defaultMessage: 'All configured agents with old UUID will not be working after that.',
  },
});

@withModal('regenerateUuidModal')
@injectIntl
export class RegenerateUuidModal extends Component {
  static propTypes = {
    data: PropTypes.shape({
      onRegenerate: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
  };
  render() {
    const { intl, data } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.OK),
      onClick: (closeModal) => {
        data.onRegenerate();
        closeModal();
      },
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
      >
        <p className={cx('warning')}>{intl.formatMessage(messages.warning)}</p>
        <p className={cx('text')}>{intl.formatMessage(messages.text)}</p>
      </ModalLayout>
    );
  }
}
