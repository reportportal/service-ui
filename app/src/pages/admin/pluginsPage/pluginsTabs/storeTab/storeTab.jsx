import classNames from 'classnames/bind';
import styles from './storeTab.scss';

const cx = classNames.bind(styles);

export const StoreTab = () => (
  <div className={cx('plugins-wrapper')}>
    <div className={cx('plugins-content-wrapper')}>
      <div className={cx('plugins-content')}>
        <h2 className={cx('plugins-content-title')}>Plugins Store</h2>
        <h3 className={cx('plugins-content-message')}>Waiting for implementation</h3>
      </div>
    </div>
  </div>
);
