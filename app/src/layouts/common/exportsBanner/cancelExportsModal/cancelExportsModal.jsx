import React from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { cancelExportsAction } from 'controllers/exports/actionCreators';
import { ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useTracking } from 'react-tracking';
import { LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './cancelExportsModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  interruptionNotice: {
    id: 'CancelExportsModal.cancelNotice',
    defaultMessage:
      'This action will interrupt the export process. Are you sure you want to stop it?',
  },
  title: {
    id: 'CancelExportsModal.title',
    defaultMessage: 'Interrupt export generation',
  },
  interrupt: {
    id: 'CancelExportsModal.interrupt',
    defaultMessage: 'Yes, interrupt',
  },
});

export const CancelExportsModal = () => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();

  const handleInterrupt = (closeModal) => {
    trackEvent(LAUNCHES_PAGE_EVENTS.CLICK_INTERRUPT_EXPORT_MODAL_BTN);
    dispatch(cancelExportsAction());
    closeModal();
  };

  const okButton = {
    text: formatMessage(messages.interrupt),
    danger: true,
    onClick: handleInterrupt,
  };

  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
    >
      <p className={cx('message')}>{formatMessage(messages.interruptionNotice)}</p>
    </ModalLayout>
  );
};
