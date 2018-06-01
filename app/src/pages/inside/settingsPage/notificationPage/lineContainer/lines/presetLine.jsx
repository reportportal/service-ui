import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from '../lineContainer.scss';

const cx = classNames.bind(styles);
export const PresetLine = ({ label }) => (
  <div
    className={cx({
      container: true,
      'container--preset': true,
    })}
  >
    <span className={cx('container__label')} />
    <div className={cx('input-part')}>
      <span
        className={cx({
          preset: true,
          'input-part--left': true,
        })}
      >
        {label}
      </span>
    </div>
  </div>
);

PresetLine.propTypes = {
  label: PropTypes.string.isRequired,
};
