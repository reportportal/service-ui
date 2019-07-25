import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './retriesCounter.scss';

const cx = classNames.bind(styles);

const formatStatusClassName = (status = '') => `status-${status.toLowerCase()}`;

const getRetries = (testItem) => [...testItem.retries, testItem];

export const RetriesCounter = ({ testItem, onLabelClick }) => {
  const retries = getRetries(testItem);
  return (
    <div className={cx('retries-counter')}>
      <div className={cx('retries-statuses')}>
        {retries.map((retry) => (
          <div
            key={retry.id}
            className={cx('status-indicator', formatStatusClassName(retry.status))}
          />
        ))}
      </div>
      <div className={cx('retries-label')}>
        <div className={cx('desktop-label')} onClick={onLabelClick}>
          <FormattedMessage
            id="RetriesCounter.label"
            defaultMessage="{count} retries"
            values={{ count: retries.length }}
          />
        </div>
        <div className={cx('mobile-label')}>
          <FormattedMessage
            id="RetriesCounter.label"
            defaultMessage="{count} retries"
            values={{ count: retries.length }}
          />
        </div>
      </div>
    </div>
  );
};
RetriesCounter.propTypes = {
  testItem: PropTypes.object.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
  onLabelClick: PropTypes.func,
};
RetriesCounter.defaultProps = {
  retries: [],
  onLabelClick: () => {},
};
