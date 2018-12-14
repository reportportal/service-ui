import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Retry } from './retry';
import styles from './retriesList.scss';

const cx = classNames.bind(styles);

export const RetriesList = ({ retries, selectedId, onRetrySelect }) => (
  <div className={cx('retries-list')}>
    {retries.map((retry, i) => (
      <Retry
        key={retry.id}
        retry={retry}
        index={i}
        selected={retry.id === selectedId}
        onClick={() => {
          onRetrySelect(retry);
        }}
      />
    ))}
  </div>
);
RetriesList.propTypes = {
  retries: PropTypes.arrayOf(PropTypes.object),
  selectedId: PropTypes.number.isRequired,
  onRetrySelect: PropTypes.func,
};
RetriesList.defaultProps = {
  retries: [],
  onRetrySelect: () => {},
};
