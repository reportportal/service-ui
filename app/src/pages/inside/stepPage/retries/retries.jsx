import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { RetriesList } from './retriesList';
import { StackTrace } from './stackTrace';
import styles from './retries.scss';

const cx = classNames.bind(styles);

export const Retries = ({
  testItemId,
  retries,
  selectedId,
  logItem,
  selectedIndex,
  onRetrySelect,
}) => (
  <div className={cx('retries')}>
    <div className={cx('list')}>
      <RetriesList retries={retries} selectedId={selectedId} onRetrySelect={onRetrySelect} />
    </div>
    <div className={cx('details')}>
      <StackTrace
        retryId={selectedId}
        testItemId={testItemId}
        index={selectedIndex}
        message={logItem.message}
      />
    </div>
  </div>
);
Retries.propTypes = {
  testItemId: PropTypes.number.isRequired,
  retries: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.number.isRequired,
  logItem: PropTypes.object.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  onRetrySelect: PropTypes.func,
};
Retries.defaultProps = {
  retries: [],
  logItem: {},
  onRetrySelect: () => {},
};
