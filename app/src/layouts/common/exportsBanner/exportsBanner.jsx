import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { BubblesLoader, Button, DeleteIcon } from '@reportportal/ui-kit';
import {
  exportsSelector,
  exportsBannerVariantSelector,
  uniqueEventsInfoByGroupSelector,
} from 'controllers/exports/selectors';
import { EXPORTS_BANNER_VARIANT_MODERN } from 'controllers/exports/constants';
import { showModalAction } from 'controllers/modal';
import CrossIcon from 'common/img/circle-cross-icon-inline.svg';
import { useTracking } from 'react-tracking';
import { CancelExportsModal } from './cancelExportsModal';
import styles from './exportsBanner.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  singleExport: {
    id: 'ExportsBanner.singleExport',
    defaultMessage: 'Report generation has started.',
  },
  multipleExport: {
    id: 'ExportsBanner.multipleExport',
    defaultMessage: 'Generation of <b>{count} reports</b> has started.',
  },
  caution: {
    id: 'ExportsBanner.caution',
    defaultMessage:
      'This may take a while, so please don’t refresh the page and wait for the download to begin.',
  },
  interrupt: {
    id: 'ExportsBanner.interrupt',
    defaultMessage: 'Interrupt',
  },
  interruptAll: {
    id: 'ExportsBanner.interruptAll',
    defaultMessage: 'Interrupt All',
  },
});

export const ExportsBanner = () => {
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const exports = useSelector(exportsSelector);
  const variant = useSelector(exportsBannerVariantSelector);
  const eventsInfoList = useSelector(uniqueEventsInfoByGroupSelector);

  const handleInterrupt = () => {
    eventsInfoList.forEach((eventsInfo) => {
      if (eventsInfo.clickInterruptBanner) trackEvent(eventsInfo.clickInterruptBanner);
    });
    dispatch(
      showModalAction({
        id: 'cancelExportsModal',
        component: <CancelExportsModal variant={variant} eventsInfoList={eventsInfoList} />,
      }),
    );
  };

  const exportCount = exports.length;

  return exportCount > 0 ? (
    <div className={cx('exports-banner-container', `variant-${variant}`)}>
      <div className={cx('exports-banner')}>
        <div className={cx('content')}>
          <p className={cx('description')}>
            <BubblesLoader className={cx('loader')} />
            {exportCount === 1
              ? formatMessage(messages.singleExport)
              : formatMessage(messages.multipleExport, {
                  count: exportCount,
                  b: (data) => <b>{data}</b>,
                })}{' '}
            {formatMessage(messages.caution)}
          </p>
          {variant === EXPORTS_BANNER_VARIANT_MODERN ? (
            <Button
              variant="text-danger"
              icon={<DeleteIcon />}
              adjustWidthOn="content"
              onClick={handleInterrupt}
            >
              {formatMessage(exportCount > 1 ? messages.interruptAll : messages.interrupt)}
            </Button>
          ) : (
            <button className={cx('interrupt-btn')} onClick={handleInterrupt}>
              <span className={cx('icon')}>{Parser(CrossIcon)}</span>
              {formatMessage(messages.interrupt)}
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;
};
