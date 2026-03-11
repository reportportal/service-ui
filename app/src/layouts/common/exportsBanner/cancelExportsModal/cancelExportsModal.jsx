import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';
import { cancelExportsAction } from 'controllers/exports/actionCreators';
import {
  EXPORTS_BANNER_VARIANT_DEFAULT,
  EXPORTS_BANNER_VARIANT_MODERN,
} from 'controllers/exports/constants';
import { hideModalAction } from 'controllers/modal';
import { ModalLayout } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useTracking } from 'react-tracking';
import styles from './cancelExportsModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  interruptionNotice: {
    id: 'ExportsBanner.CancelExportsModal.cancelNotice',
    defaultMessage:
      'This action will interrupt the export process.\nAre you sure you want to stop it?',
  },
  title: {
    id: 'ExportsBanner.CancelExportsModal.title',
    defaultMessage: 'Interrupt export generation',
  },
  titleModern: {
    id: 'ExportsBanner.CancelExportsModal.titleModern',
    defaultMessage: 'Interrupt Report Creating',
  },
  interrupt: {
    id: 'ExportsBanner.CancelExportsModal.interrupt',
    defaultMessage: 'Yes, interrupt',
  },
  interruptModern: {
    id: 'ExportsBanner.CancelExportsModal.interruptModern',
    defaultMessage: 'Interrupt',
  },
});

export const CancelExportsModal = ({
  variant = EXPORTS_BANNER_VARIANT_DEFAULT,
  eventsInfoList = [],
}) => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();

  const doInterrupt = () => {
    eventsInfoList.forEach((eventsInfo) => {
      if (eventsInfo.clickInterruptModal) trackEvent(eventsInfo.clickInterruptModal);
    });
    dispatch(cancelExportsAction());
  };

  const closeModal = () => dispatch(hideModalAction());

  if (variant === EXPORTS_BANNER_VARIANT_MODERN) {
    return (
      <Modal
        title={formatMessage(messages.titleModern)}
        onClose={closeModal}
        okButton={{
          children: formatMessage(messages.interruptModern),
          variant: 'danger',
          onClick: () => {
            doInterrupt();
            closeModal();
          },
        }}
        cancelButton={{
          children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          onClick: closeModal,
        }}
      >
        <p className={cx('message', 'message-multiline')}>
          {formatMessage(messages.interruptionNotice)}
        </p>
      </Modal>
    );
  }

  const okButton = {
    text: formatMessage(messages.interrupt),
    danger: true,
    onClick: (layoutCloseModal) => {
      doInterrupt();
      layoutCloseModal();
    },
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
      <p className={cx('message', 'message-singleline')}>
        {formatMessage(messages.interruptionNotice)}
      </p>
    </ModalLayout>
  );
};

CancelExportsModal.propTypes = {
  variant: PropTypes.oneOf([EXPORTS_BANNER_VARIANT_DEFAULT, EXPORTS_BANNER_VARIANT_MODERN]),
  eventsInfoList: PropTypes.arrayOf(PropTypes.object),
};

CancelExportsModal.defaultProps = {
  variant: EXPORTS_BANNER_VARIANT_DEFAULT,
  eventsInfoList: [],
};
