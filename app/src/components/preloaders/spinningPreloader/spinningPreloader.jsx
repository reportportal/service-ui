import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './spinningPreloader.scss';

const cx = classNames.bind(styles);

export const SpinningPreloader = ({ shown }) => (
  <div className={cx('spinning-preloader', { shown })}>
    <div className={cx('preloader')}>
      <div className={cx('preloader-part')} />
      <div className={cx('preloader-part')} />
      <div className={cx('preloader-part')} />
    </div>
  </div>
);

SpinningPreloader.propTypes = {
  shown: PropTypes.bool.isRequired,
};
