import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import { dateFormat } from 'common/utils/timeDateUtils';
import { DurationBlock } from 'pages/inside/common/durationBlock';
import { formatStatus } from 'common/utils/localizationUtils';
import styles from './retry.scss';

const cx = classNames.bind(styles);

const formatStatusClassName = (status = '') => `status-${status.toLowerCase()}`;

export const Retry = injectIntl(({ intl, retry, selected, index, onClick }) => (
  <div className={cx('retry', { selected })} onClick={onClick}>
    <div className={cx('column')}>
      <div className={cx('status-indicator', formatStatusClassName(retry.status))} />
    </div>
    <div className={cx('column', 'name')}>#{index + 1}</div>
    <div className={cx('column', 'duration')}>
      <DurationBlock
        timing={{
          start: retry.startTime,
          end: retry.endTime,
        }}
      />
    </div>
    <div className={cx('column', 'status')}>{formatStatus(intl.formatMessage, retry.status)}</div>
    <div className={cx('column', 'date')}>{dateFormat(retry.startTime)}</div>
  </div>
));
Retry.propTypes = {
  retry: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
Retry.defaultProps = {
  selected: false,
  onClick: () => {},
};
