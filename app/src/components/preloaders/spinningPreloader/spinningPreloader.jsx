import classNames from 'classnames/bind';
import styles from './spinningPreloader.scss';

const cx = classNames.bind(styles);

export const SpinningPreloader = () => (
  <div className={cx('spinning-preloader')}>
    <div className={cx('preloader')}>
      <div className={cx('preloader-part')} />
      <div className={cx('preloader-part')} />
      <div className={cx('preloader-part')} />
    </div>
  </div>
);
