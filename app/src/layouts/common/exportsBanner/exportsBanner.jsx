import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { BubblesLoader } from '@reportportal/ui-kit';
import { exportsSelector } from 'controllers/exports/selectors';
import { showModalAction } from 'controllers/modal';
import CrossIcon from 'common/img/circle-cross-icon-inline.svg';
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
    defaultMessage: 'Generation of <b>{count}</b> reports has started..',
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
});

export const ExportsBanner = () => {
  const exports = useSelector(exportsSelector);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const handleInterrupt = () => {
    dispatch(
      showModalAction({
        id: 'cancelExportsModal',
        component: <CancelExportsModal />,
      }),
    );
  };

  const exportCount = exports.length;

  return exportCount > 0 ? (
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
        <button className={cx('interrupt-btn')} onClick={handleInterrupt}>
          <span className={cx('icon')}>{Parser(CrossIcon)}</span>
          {formatMessage(messages.interrupt)}
        </button>
      </div>
    </div>
  ) : null;
};
